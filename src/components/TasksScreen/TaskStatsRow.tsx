import React from 'react';
import { View } from 'react-native';
import { StatsCard } from '../common/StatsCard';

interface TaskStatsRowProps {
    pending: number;
    active: number;
    completed: number;
    labels: {
        pending: string;
        active: string;
        completed: string;
    }
}

export const TaskStatsRow: React.FC<TaskStatsRowProps> = ({ 
    pending, 
    active, 
    completed,
    labels
}) => {
    return (
        <View className="flex-row justify-between mb-8 px-1">
            <StatsCard 
                label={labels.pending} 
                count={pending} 
                variant="warning" 
                size="small"
                className="mx-1"
            />
            <StatsCard 
                label={labels.active} 
                count={active} 
                variant="info" 
                size="small"
                className="mx-1"
            />
            <StatsCard 
                label={labels.completed} 
                count={completed} 
                variant="success" 
                size="small"
                className="mx-1"
            />
        </View>
    );
};
