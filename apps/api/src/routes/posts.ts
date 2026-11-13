import express from 'express';

import { getCategory } from './categories';

import { Post } from '../models/post';
import { Comment } from '../models/comment';

const router = express.Router();

const posts: Post[] = [];
const comments: Comment[] = [];


// GET /posts

router.get('/', (req, res) => {
  // Return all posts with status code 200
  return res.status(200).json(posts);
});


// GET /posts/category/:category

router.get('/category/:category', (req, res) => {
  const { category } = req.params;

  // Filtrar post por category
  const filteredPosts = posts.filter((post) => post.category === category);

  // devolver status 200 
  return res.status(200).json(filteredPosts);
});


// GET /posts/:id

router.get('/:id', (req, res) => {
  const { id } = req.params;

  // find por el id
  const post = posts.find((p) => p.id === id);

  // validar si existe
  if (!post) {
    return res.status(404).json({
      message: 'Post not found'
    });
  }

  // obten el category  object 
  const category = getCategory(post.category);

  // obtener comment objects
  const postComments = post.comments
    .map((commentId) => comments.find((comment) => comment.id === commentId))
    .filter((comment): comment is Comment => comment !== undefined);

  // devolver el post con category y comments
  return res.status(200).json({
    ...post,
    category,
    comments: postComments
  });
});


// POST /posts

router.post('/', (req, res) => {
  // obtener info de request body
  const { title, image, description, category } = req.body;

  // validar los campos
  if (!title || !image || !description || !category) {
    return res.status(400).json({
      message: 'All fields are required'
    });
  }

  // vaidar si la category existe
  const existingCategory = getCategory(category);

  if (!existingCategory) {
    return res.status(404).json({
      message: 'Category not found'
    });
  }

  // crear el new post
  const newPost: Post = {
    id: Date.now().toString(),
    title,
    image,
    description,
    category,
    comments: []
  };

  // salvar el post en memory
  posts.push(newPost);

  // devolver el post creado
  return res.status(201).json(newPost);
});


// POST /posts/:id/comments

router.post('/:id/comments', (req, res) => {
  // obtener el id del post de params
  const { id } = req.params;

  // buscar post por id
  const post = posts.find((p) => p.id === id);

  // validar si existe
  if (!post) {
    return res.status(404).json({
      message: 'Post not found'
    });
  }

  // obtener info del comentario
  const { author, content } = req.body;

  // validar los campos req
  if (!author || !content) {
    return res.status(400).json({
      message: 'Author and content are required'
    });
  }

  // crear el nuevo comentario
  const newComment: Comment = {
    id: Date.now().toString(),
    author,
    content
  };

  // salvarlo
  comments.push(newComment);

  // agregar el id del comentario al post
  post.comments.push(newComment.id);

  // devolver el comentario creado
  return res.status(201).json(newComment);
});


// PATCH /posts/:id

router.patch('/:id', (req, res) => {
  // obtener el pot id
  const { id } = req.params;

  // encontrar post index
  const postIndex = posts.findIndex((p) => p.id === id);

  // validar si el post index existe
  if (postIndex === -1) {
    return res.status(404).json({
      message: 'Post not found'
    });
  }

  // crear la copia superficial del post
  const updatedPost = { ...posts[postIndex] };

  // obtener la informacion req del body
  const { title, image, description, category } = req.body;

  // actualizar los campos proporcionados
  if (title !== undefined) {
    updatedPost.title = title;
  }

  if (image !== undefined) {
    updatedPost.image = image;
  }

  if (description !== undefined) {
    updatedPost.description = description;
  }

  if (category !== undefined) {
    // validar que la categoria existe
    const existingCategory = getCategory(category);

    if (!existingCategory) {
      return res.status(404).json({
        message: 'Category not found'
      });
    }

    updatedPost.category = category;
  }

  // guardar el update
  posts[postIndex] = updatedPost;

  // devolver el updated post
  return res.status(200).json(updatedPost);
});


// DELETE /posts/:id

router.delete('/:id', (req, res) => {
  // obtener el post id
  const { id } = req.params;

  // dncontrar el post index
  const postIndex = posts.findIndex((p) => p.id === id);

  // validar si el post existe
  if (postIndex === -1) {
    return res.status(404).json({
      message: 'Post not found'
    });
  }

  // remover el post del arreglo
  const [deletedPost] = posts.splice(postIndex, 1);

  // devolver el post eliminado
  return res.status(200).json(deletedPost);
});

export default router;
