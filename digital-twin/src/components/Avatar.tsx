"use client";

import { motion } from "framer-motion";
import { Bot, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface AvatarProps {
  name?: string;
  imageUrl?: string;
  isAssistant?: boolean;
  isSpeaking?: boolean;
  isThinking?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function Avatar({
  name = "Digital Twin",
  imageUrl,
  isAssistant = true,
  isSpeaking = false,
  isThinking = false,
  size = "md",
}: AvatarProps) {
  const [pulseScale, setPulseScale] = useState(1);

  // Animate when speaking
  useEffect(() => {
    if (!isSpeaking) {
      setPulseScale(1);
      return;
    }

    const interval = setInterval(() => {
      setPulseScale(0.95 + Math.random() * 0.1);
    }, 150);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-24 h-24",
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-12 h-12",
  };

  // Get initials from name
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div 
      className="relative"
      animate={{ 
        scale: isSpeaking ? pulseScale : 1 
      }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 20 
      }}
    >
      {/* Speaking/thinking ring */}
      {(isSpeaking || isThinking) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1.2 }}
          transition={{ 
            repeat: Infinity, 
            repeatType: "reverse", 
            duration: 0.8 
          }}
          className={`
            absolute inset-0 rounded-full
            ${isSpeaking ? "bg-green-400" : "bg-violet-400"}
          `}
        />
      )}

      {/* Avatar container */}
      <motion.div
        className={`
          ${sizeClasses[size]} rounded-full flex items-center justify-center
          overflow-hidden
          ${isAssistant
            ? "bg-gradient-to-br from-violet-500 to-purple-600"
            : "bg-gradient-to-br from-cyan-500 to-teal-500"
          }
        `}
        style={{ 
          boxShadow: isSpeaking 
            ? "0 8px 30px rgba(34, 197, 94, 0.4)" 
            : isThinking 
              ? "0 8px 30px rgba(139, 92, 246, 0.4)"
              : "0 4px 14px rgba(0, 0, 0, 0.1)"
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : isAssistant ? (
          <div className="flex items-center justify-center text-white font-bold">
            {initials || <Bot className={iconSizes[size]} />}
          </div>
        ) : (
          <UserIcon className={`${iconSizes[size]} text-white`} />
        )}
      </motion.div>

      {/* Online indicator */}
      {isAssistant && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`
            absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white
            ${size === "lg" ? "w-5 h-5" : "w-3 h-3"}
            ${isThinking ? "bg-yellow-400 animate-pulse" : "bg-green-500"}
          `}
        />
      )}
    </motion.div>
  );
}
