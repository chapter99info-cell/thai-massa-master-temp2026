import React from 'react';

export const HealthFundClaimQrCard: React.FC = () => {
    return (
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Scan to Claim</h2>
            <div className="w-32 h-32 bg-gray-200 mx-auto"></div>
            <p className="mt-4 text-center">Scan this QR code to claim your health fund benefit.</p>
        </div>
    );
};
