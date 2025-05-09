import {CampsCategory} from "@/types/schema.ts";

export const CAMPS_CATEGORIES = {
    [CampsCategory.CERTAINTY]: {
        name: 'Certainty',
        description: 'Confidence about the future and how things work',
        color: 'bg-blue-500'
    },
    [CampsCategory.AUTONOMY]: {
        name: 'Autonomy',
        description: 'Control over decisions that affect your work',
        color: 'bg-green-500'
    },
    [CampsCategory.MEANING]: {
        name: 'Meaning',
        description: 'Sense of purpose and fulfillment in work',
        color: 'bg-purple-500'
    },
    [CampsCategory.PROGRESS]: {
        name: 'Progress',
        description: 'Moving forward and achieving goals',
        color: 'bg-orange-500'
    },
    [CampsCategory.SOCIAL_INCLUSION]: {
        name: 'Social Inclusion',
        description: 'Feeling part of a supportive team/community',
        color: 'bg-pink-500'
    },
};