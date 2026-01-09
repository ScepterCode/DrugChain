import React from 'react';
import BatchForm from '../../components/batches/BatchForm';

const NewBatchPage: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate mb-6">
                Create Production Batch
            </h2>
            <BatchForm />
        </div>
    );
};

export default NewBatchPage;
