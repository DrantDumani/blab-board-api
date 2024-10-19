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
    return res.json({ friends });
  } catch (err) {
    return next(err);
  }
};

exports.sendFriendReq = async (req, res, next) => {
  try {
    // store the user ids in ascending order
    const userId = req.user.id;
    const friendId = Number(req.params.friendId);
    const user1_id = userId < friendId ? userId : friendId;
    const user2_id = user1_id === userId ? friendId : userId;
    const friendReq = await client.friends.create({
      data: {
        user_id: user1_id,
        friend_id: user2_id,
      },
    });
    return res.json({
      status: friendReq.status,
      friend_id: friendReq.friend_id,
      user1_id: friendReq.user_id,
    });
  } catch (err) {
    return next();
  }
};

exports.confirmFriendReq = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const friendId = Number(req.params.userId);
    const user1_id = userId < friendId ? userId : friendId;
    const user2_id = user1_id === userId ? friendId : userId;

    const acceptedReq = await client.friends.update({
      where: {
        status: "pending",
        user_id_friend_id: {
          user_id: user1_id,
          friend_id: user2_id,
        },
      },
      data: {
        status: "accepted",
        board: {
          create: {
            name: "f",
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
    });
  } catch (err) {
    return next(err);
  }
};
