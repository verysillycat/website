import { useInView } from "framer-motion";
import { RefObject } from "react";

export function useInview(ref: RefObject<HTMLElement | null>) {
    const isInView = useInView(ref, { once: true, amount: 0.2 });
    return isInView;
} 