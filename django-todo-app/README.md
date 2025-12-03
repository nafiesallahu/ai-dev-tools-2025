# Django TODO App

A modern, responsive TODO application built with Django 5.1, featuring complete CRUD functionality and a beautiful user interface.

## Features

- ✅ **Create** new tasks with title, description, and due dates
- 📝 **Read** all your tasks in a clean, organized list
- ✏️ **Update** existing tasks with ease
- 🗑️ **Delete** tasks you no longer need
- 🎯 **Mark as Complete** with one-click toggle
- 📱 **Responsive Design** that works on all devices
- 🎨 **Modern UI** with dark theme and smooth animations

## Technologies Used

- **Backend**: Django 5.1
- **Database**: SQLite3 (development) / PostgreSQL (production)
- **Frontend**: HTML5, CSS3 (no JavaScript frameworks)
- **Styling**: Custom CSS with modern design patterns

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nafiesallahu/django-todo-app.git
   cd django-todo-app
   ```

2. **Install dependencies:**
   ```bash
   pip install django
   ```

3. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

4. **Start the development server:**
   ```bash
   python manage.py runserver
   ```

5. **Open your browser:**
   Visit `http://127.0.0.1:8000/`

## Usage

- **View Tasks**: Navigate to the home page to see all your TODOs
- **Add Task**: Click "Add New Task" to create a new TODO item
- **Edit Task**: Click "Edit" on any task to modify it
- **Complete Task**: Click "Mark Done" to toggle completion status
- **Delete Task**: Click "Delete" and confirm to remove a task

## Project Structure

```
django-todo-app/
├── todo_project/          # Django project settings
│   ├── settings.py       # Main configuration
│   ├── urls.py          # URL routing
│   └── wsgi.py          # WSGI configuration
├── todo/                 # Main Django app
│   ├── models.py        # Database models (TodoItem)
│   ├── views.py         # Business logic (CRUD operations)
│   ├── urls.py          # App-specific URL routing
│   ├── templates/todo/  # HTML templates
│   └── migrations/      # Database migrations
├── db.sqlite3           # SQLite database
├── manage.py            # Django management script
└── README.md           # This file
```

## Models

### TodoItem
- `title`: Task title (required)
- `description`: Detailed description (optional)
- `due_date`: Due date (optional)
- `resolved`: Completion status (boolean)
- `created_at`: Auto-generated timestamp

## API Endpoints

- `GET /` - List all TODO items
- `GET/POST /create/` - Create new TODO item
- `GET/POST /<id>/update/` - Update existing TODO item
- `GET/POST /<id>/delete/` - Delete TODO item
- `GET /<id>/toggle/` - Toggle completion status

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Author

**Nafies Allahu** - [GitHub](https://github.com/nafiesallahu)

---

*Built with ❤️ using Django*

