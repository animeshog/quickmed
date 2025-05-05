import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface AnimatedBackgroundProps {
	intensity?: "low" | "medium" | "high";
}

// Define explicit types for animation elements
interface AnimationElement {
	type: string;
	size: number;
	position: {
		x: number;
		y: number;
	};
	duration: number;
	rotation?: number;
	animation?: {
		y?: [number, number];
	};
}

const AnimatedBackground = ({
	intensity = "medium",
}: AnimatedBackgroundProps) => {
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
	// Use the proper type for the ref
	const animationElementsRef = useRef<AnimationElement[]>([]);

	// Configure the number of elements based on intensity
	const getElementCounts = () => {
		switch (intensity) {
			case "low":
				return {
					circles: 5,
					squares: 4,
					triangles: 3,
					rings: 2,
					particles: 20,
				};
			case "high":
				return {
					circles: 12,
					squares: 8,
					triangles: 8,
					rings: 6,
					particles: 60,
				};
			case "medium":
			default:
				return {
					circles: 8,
					squares: 6,
					triangles: 5,
					rings: 4,
					particles: 40,
				};
		}
	};

	// Generate random positions once on mount
	useEffect(() => {
		const counts = getElementCounts();
		animationElementsRef.current = [];

		// Circles
		for (let i = 0; i < counts.circles; i++) {
			animationElementsRef.current.push({
				type: "circle",
				size: Math.random() * 300 + 150,
				position: {
					x: Math.random() * 100,
					y: Math.random() * 100,
				},
				duration: Math.random() * 60 + 40,
			});
		}

		// Squares
		for (let i = 0; i < counts.squares; i++) {
			animationElementsRef.current.push({
				type: "square",
				size: Math.random() * 150 + 50,
				position: {
					x: Math.random() * 100,
					y: Math.random() * 100,
				},
				rotation: Math.random() * 180,
				duration: Math.random() * 30 + 20,
			});
		}

		// Triangles
		for (let i = 0; i < counts.triangles; i++) {
			animationElementsRef.current.push({
				type: "triangle",
				size: Math.random() * 150 + 50,
				position: {
					x: Math.random() * 100,
					y: Math.random() * 100,
				},
				rotation: Math.random() * 360,
				duration: Math.random() * 25 + 20,
			});
		}

		// Rings
		for (let i = 0; i < counts.rings; i++) {
			animationElementsRef.current.push({
				type: "ring",
				size: Math.random() * 200 + 100,
				position: {
					x: Math.random() * 100,
					y: Math.random() * 100,
				},
				duration: Math.random() * 40 + 20,
			});
		}

		// Particles
		for (let i = 0; i < counts.particles; i++) {
			animationElementsRef.current.push({
				type: "particle",
				size: Math.random() * 8 + 2,
				position: {
					x: Math.random() * 100,
					y: Math.random() * 100,
				},
				animation: {
					y: [Math.random() * 100, Math.random() * 100],
				},
				duration: Math.random() * 10 + 10,
			});
		}

		// Mouse effect
		const handleMouseMove = (e: MouseEvent) => {
			setMousePosition({
				x: e.clientX / window.innerWidth,
				y: e.clientY / window.innerHeight,
			});
		};

		window.addEventListener("mousemove", handleMouseMove);
		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, [intensity]);

	return (
		<div className="absolute inset-0 w-full h-full overflow-hidden z-0">
			{/* Larger circle elements */}
			{animationElementsRef.current
				.filter((item) => item.type === "circle")
				.map((item, i) => (
					<motion.div
						key={`bg-${i}`}
						className="absolute rounded-full"
						style={{
							background: `radial-gradient(circle, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.3))`,
							width: `${item.size}px`,
							height: `${item.size}px`,
							left: `${item.position.x}%`,
							top: `${item.position.y}%`,
							transform: `translate(-50%, -50%)`,
						}}
						animate={{
							x: `${(mousePosition.x - 0.5) * 20}px`,
							y: `${(mousePosition.y - 0.5) * 20}px`,
							scale: [0.2, 0.8, 0.2],
						}}
						transition={{
							x: { type: "spring", stiffness: 10 },
							y: { type: "spring", stiffness: 10 },
							scale: {
								duration: item.duration,
								repeat: Infinity,
								repeatType: "reverse",
								ease: "easeInOut",
							},
						}}
					/>
				))}

			{/* Medium sized squares */}
			{animationElementsRef.current
				.filter((item) => item.type === "square")
				.map((item, i) => (
					<motion.div
						key={`square-${i}`}
						className="absolute rounded-lg bg-indigo-400 opacity-20"
						style={{
							width: `${item.size}px`,
							height: `${item.size}px`,
							left: `${item.position.x}%`,
							top: `${item.position.y}%`,
							transform: `translate(-50%, -50%)`,
							backdropFilter: "blur(8px)",
						}}
						animate={{
							x: `${(mousePosition.x - 0.5) * -30}px`,
							y: `${(mousePosition.y - 0.5) * -30}px`,
							rotate: [0, 180],
							opacity: [0, 0.2, 0],
						}}
						transition={{
							x: { type: "spring", stiffness: 5 },
							y: { type: "spring", stiffness: 5 },
							rotate: {
								duration: item.duration,
								repeat: Infinity,
								repeatType: "reverse",
								ease: "easeInOut",
							},
							opacity: {
								duration: item.duration,
								repeat: Infinity,
								repeatType: "reverse",
								ease: "easeInOut",
							},
						}}
					/>
				))}

			{/* Medium sized triangles */}
			{animationElementsRef.current
				.filter((item) => item.type === "triangle")
				.map((item, i) => (
					<motion.div
						key={`triangle-${i}`}
						className="absolute triangle bg-teal-400 opacity-20"
						style={{
							width: `${item.size}px`,
							height: `${item.size}px`,
							left: `${item.position.x}%`,
							top: `${item.position.y}%`,
							transform: `translate(-50%, -50%)`,
							backdropFilter: "blur(8px)",
						}}
						animate={{
							x: `${(mousePosition.x - 0.5) * 40}px`,
							y: `${(mousePosition.y - 0.5) * 40}px`,
							rotate: [0, 360],
							opacity: [0, 0.3, 0],
						}}
						transition={{
							x: { type: "spring", stiffness: 3 },
							y: { type: "spring", stiffness: 3 },
							rotate: {
								duration: item.duration,
								repeat: Infinity,
								repeatType: "reverse",
								ease: "easeInOut",
							},
							opacity: {
								duration: item.duration,
								repeat: Infinity,
								repeatType: "reverse",
								ease: "easeInOut",
							},
						}}
					/>
				))}

			{/* Ring elements */}
			{animationElementsRef.current
				.filter((item) => item.type === "ring")
				.map((item, i) => (
					<motion.div
						key={`ring-${i}`}
						className="absolute rounded-full border-8 border-cyan-400 opacity-20"
						style={{
							width: `${item.size}px`,
							height: `${item.size}px`,
							left: `${item.position.x}%`,
							top: `${item.position.y}%`,
							transform: `translate(-50%, -50%)`,
							backdropFilter: "blur(8px)",
						}}
						animate={{
							scale: [0, 1, 0],
							opacity: [0, 0.2, 0],
						}}
						transition={{
							scale: {
								duration: item.duration,
								repeat: Infinity,
								ease: "easeInOut",
							},
							opacity: {
								duration: item.duration,
								repeat: Infinity,
								ease: "easeInOut",
							},
						}}
					/>
				))}

			{/* Small particles */}
			{animationElementsRef.current
				.filter((item) => item.type === "particle")
				.map((item, i) => (
					<motion.div
						key={`particle-${i}`}
						className="absolute rounded-full bg-blue-400"
						style={{
							width: `${item.size}px`,
							height: `${item.size}px`,
							left: `${item.position.x}%`,
							top: `${item.position.y}%`,
							transform: `translate(-50%, -50%)`,
							boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
						}}
						animate={{
							y: [
								`${item.animation?.y?.[0] - 5 || 0}%`,
								`${item.animation?.y?.[1] + 5 || 100}%`,
							],
							opacity: [0, 0.8, 0],
						}}
						transition={{
							y: {
								duration: item.duration,
								repeat: Infinity,
								ease: "easeInOut",
							},
							opacity: {
								duration: item.duration,
								repeat: Infinity,
								ease: "easeInOut",
							},
						}}
					/>
				))}

			{/* Pulsing circular elements */}
			{[...Array(3)].map((_, i) => (
				<motion.div
					key={`pulse-${i}`}
					className="absolute rounded-full bg-transparent border-4 border-blue-300 opacity-20"
					style={{
						width: "300px",
						height: "300px",
						left: `${25 + i * 20}%`,
						top: `${30 + i * 15}%`,
						transform: `translate(-50%, -50%)`,
					}}
					animate={{
						scale: [1, 2, 1],
						opacity: [0.2, 0, 0.2],
					}}
					transition={{
						duration: 8 + i * 3,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				/>
			))}

			{/* Gradient overlay */}
			<div className="absolute inset-0 bg-gradient-radial from-transparent to-white opacity-60"></div>
		</div>
	);
};

export default AnimatedBackground;
