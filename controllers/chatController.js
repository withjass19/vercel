const supabase = require("../config/supabase");

exports.getOrCreateConversation = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    if (!receiverId) {
      return res.status(400).json({ msg: "receiverId is required" });
    }

    if (senderId === receiverId) {
      return res.status(400).json({ msg: "You cannot chat with yourself" });
    }

    const user1_id = senderId < receiverId ? senderId : receiverId;
    const user2_id = senderId < receiverId ? receiverId : senderId;

    let { data: conversation, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user1_id", user1_id)
      .eq("user2_id", user2_id)
      .maybeSingle();

    if (error) throw error;

    if (!conversation) {
      const result = await supabase
        .from("conversations")
        .insert([{ user1_id, user2_id }])
        .select()
        .single();

      if (result.error) throw result.error;

      conversation = result.data;
    }

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({
      msg: "Failed to create conversation",
      error: error.message,
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      msg: "Failed to fetch messages",
      error: error.message,
    });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, receiverId, message } = req.body;
    const senderId = req.user.id;

    if (!conversationId || !receiverId || !message) {
      return res.status(400).json({
        msg: "conversationId, receiverId and message are required",
      });
    }

    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          conversation_id: conversationId,
          sender_id: senderId,
          receiver_id: receiverId,
          message,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({
      msg: "Failed to send message",
      error: error.message,
    });
  }
};

exports.markMessagesAsSeen = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from("messages")
      .update({ seen: true })
      .eq("conversation_id", conversationId)
      .eq("receiver_id", userId)
      .eq("seen", false);

    if (error) throw error;

    res.status(200).json({ msg: "Messages marked as seen" });
  } catch (error) {
    res.status(500).json({
      msg: "Failed to mark messages as seen",
      error: error.message,
    });
  }
};