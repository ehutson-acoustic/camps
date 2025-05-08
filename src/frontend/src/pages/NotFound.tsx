import React from 'react';
import {Link} from 'react-router-dom';
import {Button} from '@/components/ui/button';

const NotFound: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
            <p className="text-muted-foreground mb-8">
                The page you are looking for doesn't exist or has been moved.
            </p>
            <Button asChild>
                <Link to="/">Return to Dashboard</Link>
            </Button>
        </div>
    );
};

export default NotFound;