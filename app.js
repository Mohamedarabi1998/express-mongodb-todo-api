const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Todo = require('./models/Todo');

dotenv.config();

const app = express();

// إعدادات Middleware لفهم بيانات JSON وإرسالها
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// الاتصال بقاعدة البيانات MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/todoDB';
mongoose.connect(MONGO_URI)
  .then(() => console.log('تم الاتصال بـ MongoDB بنجاح'))
  .catch(err => console.error('خطأ في الاتصال بـ MongoDB:', err));

// --- مسارات الـ API (RESTful API Routes) ---

// 1. GET: جلب جميع المهام
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: todos.length,
      data: todos
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'حدث خطأ أثناء جلب المهام' });
  }
});

// 2. POST: إضافة مهمة جديدة
app.post('/api/todos', async (req, res) => {
  try {
    const { task } = req.body;
    if (!task) {
      return res.status(400).json({ success: false, error: 'يرجى كتابة نص المهمة' });
    }
    const newTodo = await Todo.create({ task });
    res.status(201).json({
      success: true,
      message: 'تمت إضافة المهمة بنجاح',
      data: newTodo
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'حدث خطأ أثناء إضافة المهمة' });
  }
});

// 3. PUT: تحديث حالة المهمة (أو تعديلها)
app.put('/api/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ success: false, error: 'المهمة غير موجودة' });
    }
    
    // عكس حالة completed أو تحديث النص إذا تم إرساله
    todo.completed = req.body.completed !== undefined ? req.body.completed : !todo.completed;
    if (req.body.task) todo.task = req.body.task;
    
    await todo.save();
    res.status(200).json({
      success: true,
      message: 'تم تحديث المهمة بنجاح',
      data: todo
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'حدث خطأ أثناء تحديث المهمة' });
  }
});

// 4. DELETE: حذف مهمة
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) {
      return res.status(404).json({ success: false, error: 'المهمة غير موجودة' });
    }
    res.status(200).json({
      success: true,
      message: 'تم حذف المهمة بنجاح'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'حدث خطأ أثناء حذف المهمة' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`خادم الـ API يعمل على المنفذ http://localhost:${PORT}`);
});