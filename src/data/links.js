import { Youtube, Video, FileText, Image, Terminal, Film, Music, Briefcase, Wrench, Monitor, Cpu, HardDrive } from 'lucide-react';

export const links = [
    {
        id: 1,
        title: "Portfolio",
        subtitle: "My Work",
        url: "https://portfolio.khoavo.myds.me",
        icon: Briefcase,
        group: "primary",
        order: 1
    },
    {
        id: 2,
        title: "CV",
        subtitle: "Resume",
        url: "https://cv.khoavo.myds.me",
        icon: FileText,
        group: "primary",
        order: 2
    },
    {
        id: 3,
        title: "YouTube",
        subtitle: "Ad-free",
        url: "https://ut.khoavo.myds.me",
        icon: Youtube,
        group: "media",
        order: 1
    },
    {
        id: 4,
        title: "TikTok",
        subtitle: "Ad-free",
        url: "https://tt.khoavo.myds.me",
        icon: Video,
        group: "media",
        order: 2
    },
    {
        id: 5,
        title: "Spotify",
        subtitle: "Streaming",
        url: "https://sp.khoavo.myds.me",
        icon: Music,
        group: "media",
        order: 4
    },
    {
        id: 7,
        title: "Netflix",
        subtitle: "Streaming",
        url: "https://nf.khoavo.myds.me",
        icon: Film,
        group: "media",
        order: 5
    },
    {
        id: 8,
        title: "RM8PFix",
        subtitle: "Tools",
        url: "https://rm8pfix.khoavo.myds.me",
        icon: Wrench,
        group: "tools",
        order: 1
    },
    {
        id: 9,
        title: "Portal",
        subtitle: "Save",
        url: "https://save.khoavo.myds.me",
        icon: HardDrive,
        group: "tools",
        order: 2
    },
    {
        id: 10,
        title: "Free",
        subtitle: "Free",
        url: "https://free.khoavo.myds.me",
        icon: Wrench,
        group: "tools",
        order: 3
    },
    {
        id: 11,
        title: "PDF",
        subtitle: "Tools",
        url: "https://pdf.khoavo.myds.me",
        icon: FileText,
        group: "tools",
        order: 4
    },
    {
        id: 12,
        title: "JPG",
        subtitle: "Tools",
        url: "https://jpg.khoavo.myds.me",
        icon: Image,
        group: "tools",
        order: 5
    },
    {
        id: 13,
        title: "IT Utilities",
        subtitle: "Dev Tools",
        url: "https://it.khoavo.myds.me",
        icon: Terminal,
        group: "tools",
        order: 6
    },
];

export const groups = [
    { 
        id: 'primary', 
        title: 'primary', 
    },
    { 
        id: 'media', 
        title: 'media', 
    },
    { 
        id: 'tools', 
        title: 'tools', 
    },
];