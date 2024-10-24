# Blab Board API

[Live Website](https://blab-board.netlify.app)

Backend for Blab Board messaging app. The [Front End repository](https://github.com/DrantDumani/Blab-board) can be found here.

## Tech Stack

- Express JS
- Postgresql
- Supertest
- Socket.io

Supertest was used to write unit and integration tests for routes and controllers. PassportJS was used for user authentication via jwt strategy. This is a RESTful api, but socket.io is explicitly used to for live chat and member updates.
