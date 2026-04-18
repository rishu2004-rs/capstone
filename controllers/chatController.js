const Message = require('../models/Message');
const Case = require('../models/Case');

// @desc    Get chat messages for a case
// @route   GET /api/chat/:caseId
// @access  Private
const getMessages = async (req, res) => {
    const messages = await Message.find({ caseId: req.params.caseId })
        .populate('sender', 'name role')
        .sort({ createdAt: 1 });
    
    res.json(messages);
};

// @desc    Send a message
// @route   POST /api/chat
// @access  Private
const sendMessage = async (req, res) => {
    const { caseId, content, receiverId } = req.body;

    if (!content || !caseId) {
        return res.status(400).json({ message: 'Content and Case ID are required' });
    }


    const message = new Message({
        caseId,
        sender: req.user._id,
        receiver: receiverId,
        content
    });

    const savedMessage = await message.save();
    const populatedMessage = await Message.findById(savedMessage._id).populate('sender', 'name role');
    
    // Emit to Socket.io
    const io = req.app.get('io');
    io.to(caseId).emit('new_message', populatedMessage);

    res.status(201).json(populatedMessage);
};


module.exports = {
    getMessages,
    sendMessage
};
