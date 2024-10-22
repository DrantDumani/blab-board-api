const client = require("../prisma/client");

exports.getAllFriends = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const friends =
      await client.$queryRaw`SELECT "Users".id, "Users".username, "Users".pfp, "Friends".status, "Friends".board_id from
      "Users" JOIN "Friends" ON "Users".id = "Friends".user_id
      WHERE "Friends".friend_id = ${userId}
      UNION
      SELECT "Users".id, "Users".username, "Users".pfp, "Friends".status, "Friends".board_id FROM
      "Users" JOIN "Friends" ON "Users".id = "Friends".friend_id
      WHERE "Friends".user_id = ${userId}`;
    return res.json(friends);
  } catch (err) {
    return next(err);
  }
};

exports.sendFriendReq = async (req, res, next) => {
  try {
    // if friendId and req.user.id are the same, return bad request
    if (req.user.id === Number(req.params.friendId))
      throw new Error({ code: 400 });
    // store the user ids in ascending order
    const userId = req.user.id;
    const friendId = Number(req.params.friendId);
    const user1_id = userId < friendId ? userId : friendId;
    const user2_id = user1_id === userId ? friendId : userId;

    const status = userId === user1_id ? "pending_1_2" : "pending_2_1";

    const friendReq = await client.friends.create({
      data: {
        user_id: user1_id,
        friend_id: user2_id,
        status: status,
      },
    });
    return res.json({
      status: friendReq.status,
      friend_id: friendReq.friend_id,
      user1_id: friendReq.user_id,
    });
  } catch (err) {
    if (err.code === 400) return res.status(400).json({ msg: "Bad Request" });
    return next();
  }
};

exports.confirmFriendReq = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const friendId = Number(req.params.userId);
    const user1_id = userId < friendId ? userId : friendId;
    const user2_id = user1_id === userId ? friendId : userId;

    // senders cannot accept their own friend requests
    const notStatus = userId === user1_id ? "pending_1_2" : "pending_2_1";

    const acceptedReq = await client.friends.update({
      where: {
        user_id_friend_id: {
          user_id: user1_id,
          friend_id: user2_id,
        },
        NOT: {
          status: notStatus,
        },
      },
      data: {
        status: "accepted",
        board: {
          create: {
            name: "DM",
            creator_id: user1_id,
            type: "private",
            members: {
              connect: [{ id: user1_id }, { id: user2_id }],
            },
          },
        },
      },
    });

    res.json({
      user_id: acceptedReq.user_id,
      friend_id: acceptedReq.friend_id,
      status: acceptedReq.status,
      board_id: acceptedReq.board_id,
    });
  } catch (err) {
    return next(err);
  }
};

exports.deleteFriend = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const friendId = Number(req.params.friendId);
    const user1_id = userId < friendId ? userId : friendId;
    const user2_id = user1_id === userId ? friendId : userId;

    const deletedFriend = await client.friends.delete({
      where: {
        user_id_friend_id: {
          user_id: user1_id,
          friend_id: user2_id,
        },
      },
    });

    return res.json({
      friend_id: deletedFriend.friend_id,
      user_id: deletedFriend.user_id,
    });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};
