const express = require('express');
const postController = require('../controllers/postController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validate, postRules } = require('../middleware/validation');

const router = express.Router();

const canWrite = [verifyToken, requireRole('admin', 'editor', 'author')];

router.get('/', postController.list);
router.get('/mine', verifyToken, postController.mine);
router.get('/:slug', postController.getBySlug);
router.post('/', canWrite, postRules, validate, postController.create);
router.put('/:id', canWrite, postController.update);
router.delete('/:id', canWrite, postController.remove);

module.exports = router;
