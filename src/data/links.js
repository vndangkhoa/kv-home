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
        subtitle: "No Ads",
        url: "https://ut.khoavo.myds.me",
        icon: Youtube,
        group: "entertainment",
        order: 1
    },
    {
        id: 4,
        title: "TikTok",
        subtitle: "No Ads",
        url: "https://tt.khoavo.myds.me",
        icon: Video,
        group: "entertainment",
        order: 2
    },
    {
        id: 5,
        title: "Music",
        subtitle: "Streaming",
        url: "https://music.khoavo.myds.me",
        icon: Music,
        group: "entertainment",
        order: 3
    },
    {
        id: 6,
        title: "Spotify",
        subtitle: "Streaming",
        url: "https://sp.khoavo.myds.me",
        icon: Music,
        group: "entertainment",
        order: 4
    },
    {
        id: 7,
        title: "Netflix",
        subtitle: "Streaming",
        url: "https://nf.khoavo.myds.me",
        icon: Film,
        group: "entertainment",
        order: 5
    },
    {
        id: 8,
        title: "RM8PFix",
        subtitle: "Fixes & Tools",
        url: "https://rm8pfix.khoavo.myds.me",
        icon: Wrench,
        group: "rm8pfix-vn",
        order: 1
    },
    {
        id: 9,
        title: "Portal",
        subtitle: "Save",
        url: "https://save.khoavo.myds.me",
        icon: HardDrive,
        group: "rm8pfix-vn",
        order: 2
    },
    {
        id: 10,
        title: "Free",
        subtitle: "Free",
        url: "https://free.khoavo.myds.me",
        icon: Wrench,
        group: "rm8pfix-vn",
        order: 3
    },
    {
        id: 11,
        title: "PDF",
        subtitle: "Tools",
        url: "https://pdf.khoavo.myds.me",
        icon: FileText,
        group: "dev",
        order: 1
    },
    {
        id: 12,
        title: "JPG",
        subtitle: "Tools",
        url: "https://jpg.khoavo.myds.me",
        icon: Image,
        group: "dev",
        order: 2
    },
    {
        id: 13,
        title: "IT Utilities",
        subtitle: "Dev Tools",
        url: "https://it.khoavo.myds.me",
        icon: Terminal,
        group: "dev",
        order: 3
    },
];

export const groups = [
    { 
        id: 'primary', 
        title: 'PRIMARY', 
        icon: Briefcase,
        description: "Have you ever wondered how your digital presence is routed across different platforms? The primary resource layer acts as the centralized directory for all professional identities. These components are hard-coded for maximum reliability and persistent access to the core VNDK ecosystem."
    },
    { 
        id: 'entertainment', 
        title: 'MEDIA_DISTRIBUTION', 
        icon: Monitor,
        description: "Digital consumption and leisure systems operate on a separate high-fidelity distribution plane. By utilizing unauthorized ad-blocking layers and clean streaming protocols, we ensure that media remains an uninterrupted experience within the portal."
    },
    { 
        id: 'rm8pfix-vn', 
        title: 'SYSTEM_MAINTENANCE', 
        icon: Wrench,
        description: "This terminal routes directly to the REDMAGIC hardware modification group. Representing flagship architecture (builds 8, 9, and 10 Pro), these devices feature top-tier Snapdragon processing and kernel-level flexibility, granting enthusiasts absolute administrative control to deeply customize their systems."
    },
    { 
        id: 'dev', 
        title: 'DEVELOPMENT_STACK', 
        icon: Cpu,
        description: "Because our software tools are built on primitive data types, we need a robust stack to handle rasterization, PDF serialization, and IT utility execution. This toolkit provides the necessary abstractions to manipulate system state at the binary level."
    },
];