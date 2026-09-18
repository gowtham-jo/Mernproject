import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';

// @desc    Get all conversations for the logged in user
// @route   GET /api/conversations
// @access  Private
export const getConversations = catchAsync(async (req, res, next) => {
  const conversations = await Conversation.find({
    participants: { $in: [req.user.id] },
  })
    .populate('participants', 'name email profileImage role')
    .populate('course', 'title')
    .sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    count: conversations.length,
    data: { conversations },
  });
});

// @desc    Get or create conversation between users
// @route   POST /api/conversations
// @access  Private
export const getOrCreateConversation = catchAsync(async (req, res, next) => {
  const { participantId, courseId } = req.body;
  const currentUserId = req.user.id;

  if (!participantId) {
    return next(new AppError('Participant ID is required', 400));
  }

  if (participantId === currentUserId) {
    return next(new AppError('You cannot create a chat conversation with yourself', 400));
  }

  const participant = await User.findById(participantId);
  if (!participant) {
    return next(new AppError('User not found', 404));
  }

  // Look for existing conversation between both participants
  let conversation = await Conversation.findOne({
    participants: { $all: [currentUserId, participantId], $size: 2 },
  })
    .populate('participants', 'name email profileImage role')
    .populate('course', 'title');

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [currentUserId, participantId],
      course: courseId || undefined,
    });

    conversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name email profileImage role')
      .populate('course', 'title');
  }

  res.status(200).json({
    success: true,
    data: { conversation },
  });
});

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
export const getMessages = catchAsync(async (req, res, next) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: { $in: [req.user.id] },
  });

  if (!conversation) {
    return next(new AppError('Conversation not found or access denied', 404));
  }

  const messages = await Message.find({ conversation: conversationId })
    .populate('sender', 'name email profileImage role')
    .sort({ createdAt: 1 });

  // Mark unread messages as read by current user
  await Message.updateMany(
    { conversation: conversationId, readBy: { $ne: req.user.id } },
    { $addToSet: { readBy: req.user.id } }
  );

  res.status(200).json({
    success: true,
    count: messages.length,
    data: { messages },
  });
});

// @desc    Send a message in a conversation
// @route   POST /api/messages
// @access  Private
export const sendMessage = catchAsync(async (req, res, next) => {
  const { conversationId, content } = req.body;

  if (!content || !content.trim()) {
    return next(new AppError('Message content cannot be empty', 400));
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: { $in: [req.user.id] },
  });

  if (!conversation) {
    return next(new AppError('Conversation not found or access denied', 404));
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: req.user.id,
    content: content.trim(),
    readBy: [req.user.id],
  });

  // Update conversation lastMessage
  conversation.lastMessage = {
    content: content.trim(),
    sender: req.user.id,
    createdAt: new Date(),
  };
  await conversation.save();

  const populatedMessage = await Message.findById(message._id).populate(
    'sender',
    'name email profileImage role'
  );

  res.status(201).json({
    success: true,
    data: { message: populatedMessage },
  });
});
