import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
			<div className="text-center">
				<h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
				<h2 className="text-2xl font-semibold text-gray-700 mb-6">
					Page Not Found
				</h2>
				<p className="text-gray-600 mb-8 max-w-md mx-auto">
					The page you are looking for might have been removed, had its name
					changed, or is temporarily unavailable.
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Button
						variant="default"
						onClick={() => navigate(-1)}
						className="flex items-center"
					>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Go Back
					</Button>
					<Button
						variant="outline"
						onClick={() => navigate("/")}
						className="flex items-center"
					>
						<Home className="mr-2 h-4 w-4" />
						Return Home
					</Button>
				</div>
			</div>
		</div>
	);
};

export default NotFound;
