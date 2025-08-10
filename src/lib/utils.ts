import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateRandomId(length = 6) {
  return Math.random().toString(36).substring(2, 2 + length);
}

export function generateRandomName() {
  const adjectives = ['Happy', 'Silly', 'Clever', 'Brave', 'Witty', 'Curious', 'Dizzy', 'Funny', 'Swift', 'Wise'];
  const nouns = ['Panda', 'Tiger', 'Lion', 'Bear', 'Fox', 'Wolf', 'Eagle', 'Shark', 'Hawk', 'Badger'];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 1000);
  return `${randomAdjective}${randomNoun}${randomNumber}`;
}

export function formatTime(seconds: number) {
  if (isNaN(seconds) || seconds < 0) {
    return '0:00';
  }
  const floored = Math.floor(seconds);
  const min = Math.floor(floored / 60);
  const sec = floored % 60;
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}
