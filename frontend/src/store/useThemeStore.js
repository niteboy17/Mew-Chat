import {create} from "zustand";

export const useThemeStore = create((set) => ({
    theme: localStorage.getItem("chat-theme") || "retro",
    setTheme: (theme) => {
        localStorage.setItem("chat-theme", theme);

        if (typeof document !== "undefined") {
            document.documentElement.setAttribute("data-theme", theme);
        }

        set({theme});
    
    } 
}))

if (typeof document !== "undefined") {
    document.documentElement.setAttribute(
        "data-theme",
        localStorage.getItem("chat-theme") || "retro"
    );
}