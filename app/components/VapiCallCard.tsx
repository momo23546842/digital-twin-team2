'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function VapiCallCard() {
  const phoneNumber = '+1 541 303 8579';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // QRコード生成URL（Google Charts API使用）
  const qrCodeUrl = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=tel:${encodeURIComponent(phoneNumber)}`;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-3xl shadow-2xl overflow-hidden border-2 border-purple-200 dark:border-purple-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold">AIに電話してみよう</h3>
            <p className="text-purple-100 text-sm">24時間いつでも対応可能</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Phone Number & Actions */}
          <div className="space-y-6">
            {/* Phone Number Display */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wide">
                電話番号
              </p>
              <div className="flex items-center justify-between gap-4">
                <a 
                  href={`tel:${phoneNumber}`}
                  className="text-3xl font-bold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-mono"
                >
                  {phoneNumber}
                </a>
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                  title="Copy phone number"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-green-600">コピー済み</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                      <span>コピー</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Call Button (Mobile優先) */}
            <a
              href={`tel:${phoneNumber}`}
              className="block w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-150 text-center text-lg"
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span>今すぐ電話する</span>
              </div>
            </a>

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium">24時間365日対応</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium">即座にAIが応答</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium">通話料金無料</span>
              </div>
            </div>
          </div>

          {/* Right: QR Code */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-white p-6 rounded-2xl shadow-lg">
              <img 
                src={qrCodeUrl}
                alt="QR Code to call"
                width={200}
                height={200}
                className="rounded-lg"
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                スマホでスキャン
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                カメラアプリでQRコードを読み取ると<br />
                自動的に電話をかけられます
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Instructions */}
        <div className="mt-8 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            💡 使い方
          </h4>
          <ol className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <span>上記の電話番号に電話をかける（またはQRコードをスキャン）</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <span>AIアシスタントが自動で応答します</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <span>質問や相談を自然に話してください</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
              <span>終了する時は「さようなら」または「終わります」と言ってください</span>
            </li>
          </ol>
        </div>

        {/* Call History Link */}
        <div className="mt-6">
          <a
            href="/calls"
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-sm flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            通話履歴を確認
          </a>
        </div>
      </div>
    </div>
  );
}
