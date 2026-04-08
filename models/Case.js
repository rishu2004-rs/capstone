const mongoose = require('mongoose');

const caseSchema = mongoose.Schema({
    caseNumber: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    petitioner: {
        type: String,
        required: true
    },
    respondent: {
        type: String,
        required: true
    },
    courtName: {
        type: String,
        required: true
    },
    advocate: {
        type: String
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'In Progress', 'Hearing Scheduled', 'Closed', 'Dismissed'],
        default: 'Pending'
    },
    hearingDate: {
        type: Date
    },
    description: {
        type: String,
        required: true
    },
    documents: [
        {
            name: String,
            url: String,
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    history: [
        {
            status: String,
            hearingDate: Date,
            updatedAt: {
                type: Date,
                default: Date.now
            },
            updatedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }
    ],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const Case = mongoose.model('Case', caseSchema);
module.exports = Case;
