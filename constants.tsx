
import React from 'react';
import { Palette, Share2, Globe, Sparkles, Video } from 'lucide-react';
import { Service } from './types.ts';

export const SERVICES: Service[] = [
  {
    id: 'graphic-design',
    title: 'Graphic Design & Visual Identity',
    description: 'Transform your vision into striking visuals that resonate with your audience.',
    fullDescription: 'Our graphic design team specializes in creating cohesive visual languages that tell your brand story across all mediums. From brochures to digital illustrations, we ensure every pixel serves a purpose.',
    icon: 'Palette',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=1000',
    features: ['Custom Illustrations', 'Print & Digital Layouts', 'Infographic Design', 'Package Design']
  },
  {
    id: 'social-media',
    title: 'Social Media & Content Creatives',
    description: 'Engage your community with thumb-stopping content designed for growth.',
    fullDescription: 'We help brands dominate the social landscape through strategic content creation, trend-aware design, and consistent messaging that builds real communities.',
    icon: 'Share2',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=1000',
    features: ['Instagram/TikTok Strategy', 'Motion Graphics', 'Community Engagement', 'Paid Ad Creatives']
  },
  {
    id: 'web-design',
    title: 'Website Design & UI/UX',
    description: 'Seamless digital experiences built on the pillars of functionality and aesthetics.',
    fullDescription: 'We build websites that are more than just digital brochures. Our UI/UX process focuses on user journey optimization, performance, and modern responsive design.',
    icon: 'Globe',
    image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&q=80&w=1000',
    features: ['User Experience Research', 'Responsive Web Design', 'Interactive Prototyping', 'Conversion Optimization']
  },
  {
    id: 'branding',
    title: 'Branding & Digital Presence',
    description: 'Define your unique market position with a brand identity that stands the test of time.',
    fullDescription: 'A brand is more than a logo. We help you define your mission, values, and visual presence to create a lasting impact in a crowded digital marketplace.',
    icon: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=1000',
    features: ['Brand Voice & Tone', 'Logo Suites', 'Brand Style Guides', 'Market Positioning']
  },
  {
    id: 'media-content',
    title: 'Media, Content & Storytelling',
    description: 'Compelling digital storytelling through high-quality video and media production.',
    fullDescription: 'Video is the most powerful tool for connection. Our media team crafts cinematic narratives that capture your brand essence and deliver results.',
    icon: 'Video',
    image: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&q=80&w=1000',
    features: ['Short-form Video Production', 'Scriptwriting', 'Post-production Editing', 'Sound Design']
  }
];

export const getIcon = (name: string) => {
  switch (name) {
    case 'Palette': return <Palette className="w-6 h-6" />;
    case 'Share2': return <Share2 className="w-6 h-6" />;
    case 'Globe': return <Globe className="w-6 h-6" />;
    case 'Sparkles': return <Sparkles className="w-6 h-6" />;
    case 'Video': return <Video className="w-6 h-6" />;
    default: return <Sparkles className="w-6 h-6" />;
  }
};
