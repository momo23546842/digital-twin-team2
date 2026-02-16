'use client';

import { useState, useEffect } from 'react';

interface PhoneCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PhoneCallModal({ isOpen, onClose }: PhoneCallModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // 通話時間カウンター
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartCall = async () => {
    if (!phoneNumber) {
      alert('電話番号を入力してください');
      return;
    }

    // Vapi Web SDKを使用して通話を開始
    try {
      // TODO: Vapi Web SDKの実装
      setIsCallActive(true);
      console.log('Calling:', phoneNumber);
    } catch (error) {
      console.error('Failed to start call:', error);
      alert('通話を開始できませんでした');
    }
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setCallDuration(0);
    setPhoneNumber('');
    // TODO: Vapi通話終了処理
  };

  const handleDialPad = (digit: string) => {
    setPhoneNumber(prev => prev + digit);
  };

  const handleDelete = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {isCallActive ? '通話中' : 'AI電話アシスタント'}
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {!isCallActive ? (
            <>
              {/* Phone Number Display */}
              <div className="mb-6">
                <div className="bg-white rounded-2xl shadow-inner p-4 border-2 border-gray-200">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="電話番号を入力"
                    className="w-full text-2xl font-semibold text-center bg-transparent outline-none"
                  />
                </div>
              </div>

              {/* Dial Pad */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handleDialPad(digit)}
                    className="bg-white hover:bg-gray-100 active:bg-gray-200 rounded-xl py-4 text-xl font-semibold shadow-md transition-all duration-150 border border-gray-200"
                  >
                    {digit}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
                >
                  削除
                </button>
                <button
                  onClick={handleStartCall}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-150 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  発信
                </button>
              </div>

              {/* Quick Dial - Vapi Number */}
              <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
                <p className="text-sm text-gray-600 mb-2">クイックダイヤル:</p>
                <button
                  onClick={() => setPhoneNumber('+15413038579')}
                  className="w-full bg-white hover:bg-gray-50 text-left px-4 py-3 rounded-lg shadow-sm border border-gray-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">AIアシスタント</p>
                      <p className="text-sm text-gray-500">+1 541 303 8579</p>
                    </div>
                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Active Call UI */}
              <div className="text-center mb-8">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-1">通話中</p>
                <p className="text-2xl font-bold text-gray-900">{phoneNumber}</p>
                <p className="text-3xl font-mono font-bold text-green-600 mt-4">
                  {formatDuration(callDuration)}
                </p>
              </div>

              {/* Call Controls */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`flex flex-col items-center justify-center py-4 rounded-xl transition-colors ${
                    isMuted 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
                    {isMuted ? (
                      <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    )}
                  </svg>
                  <span className="text-xs font-medium">
                    {isMuted ? 'ミュート中' : 'ミュート'}
                  </span>
                </button>

                <button className="flex flex-col items-center justify-center py-4 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium">キーパッド</span>
                </button>

                <button className="flex flex-col items-center justify-center py-4 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <svg className="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium">設定</span>
                </button>
              </div>

              {/* End Call Button */}
              <button
                onClick={handleEndCall}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-4 rounded-xl shadow-lg transition-all duration-150 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                通話終了
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
