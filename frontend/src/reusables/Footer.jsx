import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="mt-8 text-center text-sm text-gray-600 px-4">
            <p className="flex flex-wrap items-center justify-center gap-4">
                Created by <span className="font-semibold">Satyam Prajapati</span>
                <a 
                    href="https://github.com/mrstmcpp" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-800 flex items-center gap-1"
                >
                    <FaGithub /> GitHub
                </a>
                <a 
                    href="https://www.linkedin.com/in/mrstmcpp" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                    <FaLinkedin /> LinkedIn
                </a>
            </p>
        </footer>
    );
};

export default Footer;
