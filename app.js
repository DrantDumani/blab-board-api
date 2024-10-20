const express = require("express");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config();
const { Server } = require("socket.io");

const userRouter = require("./routers/userRouter");
const boardRouter = require("./routers/boardsRouter");
const memberRouter = require("./routers/membersRouter");
const postRouter = require("./routers/postsRouter");

const port = process.env.PORT;

const app = express();
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: ["http://localhost:5173"],
  })
);

app.use(express.static("public"));
app.use("/users", userRouter);
app.use("/boards", boardRouter);
app.use("/members", memberRouter);
app.use("/posts", postRouter);

app.use((err, req, res, next) => {
  if (req.app.get("env") === "development") console.error(err);
});

const httpServer = app.listen(port, () => {
  console.log(`Currently running on port ${port}`);
});
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});
app.set("socketio", io);

// when someone connects, have them join a room
io.on("connection", (socket) => {
  socket.on("joinRoom", async ({ roomId, userId }) => {
    socket.join(roomId);
    socket.data.userId = userId;
    const socketsInRoom = await io.in(roomId).fetchSockets();
    const usersInRoom = socketsInRoom
      .map((s) => s.data.userId)
      .reduce((acc, val) => {
        acc[val] = val;
        return acc;
      }, {});
    io.to(roomId).emit("usersOnline", usersInRoom);
    console.log("User " + userId + " connected to room: " + roomId);
  });
  socket.on("disconnect", () => {
    socket.broadcast.emit("userWentOffline", socket.data.userId);
    console.log("Client has disconnected");
  });
});
