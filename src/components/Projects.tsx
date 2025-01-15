'use client'
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import { motion } from "framer-motion";
import { TextFade } from "../app/structure/TextFade";
import Image from "next/image";
const projects = [
    {
        name: "Equibop",
        description: "A custom Discord App aiming to give you better performance and improvements forked from Vesktop",
        url: "https://github.com/Equicord/Equibop",
        icon: "https://github.com/Equicord/Equibop/raw/main/static/icon.png"
    },
    {
        name: "VNREZ",
        description: "Utility-suite for recording and screenshotting your files easily and uploading them to a file host",
        url: "https://github.com/verysillycat/vnrez",
        icon: "https://github.com/verysillycat/vnrez/raw/main/assets/logo.png"
    },
];

export default function Projects() {
    return (
        <div className="mt-10 flex flex-col items-center">
            <TextFade
                duration={1.2}
                words="Projects"
                className="text-xl font-bold text-white"
            />

            <div className={`grid ${
                projects.length < 3 
                    ? 'grid-cols-1 sm:grid-cols-2 max-w-[700px]' 
                    : 'grid-cols-2 sm:grid-cols-3 max-w-[1000px]'
                } gap-6 mb-1 mx-auto w-[95%] p-4 justify-center`}>
                {projects.map((project, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20, scale: 0.98, rotateX: -10 }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                        transition={{ 
                            duration: 0.5,
                            delay: index * 0.1,
                            ease: [0.23, 1, 0.32, 1],
                            opacity: { duration: 0.4 },
                            y: { duration: 0.4 },
                            scale: { duration: 0.5 },
                            rotateX: { duration: 0.6 }
                        }}
                    >
                        <Card className="bg-black bg-opacity-25 border border-[#dbdbdb] rounded-md relative z-0 transition-all duration-300 ease-in-out hover:shadow-[0_0_8px_rgba(255,255,255,0.15)] hover:border-opacity-60">
                            <CardHeader className="px-4 pt-4 flex gap-3 justify-between">
                                <div className="flex gap-3">
                                    {project.icon && (
                                        <Image
                                            src={project.icon} 
                                            alt={`${project.name} icon`}
                                            width={32}
                                            height={32}
                                            className="w-8 h-8 object-contain mb-1"
                                        />
                                    )}
                                    <h2 className="text-lg font-bold tracking-tight text-white">
                                        {project.name}
                                    </h2>
                                </div>
                                <a 
                                    href={project.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex bg-zinc-900 p-2 rounded-full duration-200 ease-in-out hover:bg-zinc-800 hover:scale-105 -mt-1 overflow-visible"
                                >
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        className="fill-blue-100 h-4 w-4 mx-auto overflow-visible" 
                                        viewBox="0 0 16 16"
                                    >
                                        <path fillRule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
                                        <path fillRule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
                                    </svg>
                                </a>
                            </CardHeader>
                            <CardBody className="px-4 pb-4">
                                <p className="text-gray-300 text-sm">
                                    {project.description}
                                </p>
                            </CardBody>
                        </Card>
                    </motion.div>
                ))}
            </div>
            
            <TextFade
                duration={1.4}
                words="... and have contributed to multiple frontend projects"
                className="text-sm text-gray-400 mb-16 italic text-center w-full px-3"
            />
        </div>
    )
}
