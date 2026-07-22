import { CircleAlertIcon, ImageIcon, UploadIcon, XIcon } from "lucide-react";
import { Alert, AlertTitle } from "@/components/reui/alert";
import { Button } from "@/components/ui/button";
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload";
import { cn } from "@/lib/utils";

const DEFAULT_MAX_SIZE = 2 * 1024 * 1024;
const DEFAULT_ACCEPT = "image/png,image/jpeg,image/webp,image/svg+xml";

interface ImageUploadProps {
	onChange: (file: File | null) => void;
	existingImageUrl?: string | null;
	alt: string;
	label?: string;
	accept?: string;
	maxSize?: number;
}

export function ImageUpload({
	onChange,
	existingImageUrl,
	alt,
	label = "imagem",
	accept = DEFAULT_ACCEPT,
	maxSize = DEFAULT_MAX_SIZE,
}: ImageUploadProps) {
	const [
		{ files, isDragging, errors },
		{
			removeFile,
			handleDragEnter,
			handleDragLeave,
			handleDragOver,
			handleDrop,
			openFileDialog,
			getInputProps,
		},
	] = useFileUpload({
		accept,
		maxSize,
		multiple: false,
		onFilesChange: (newFiles) => {
			const current = newFiles[0];
			onChange(current?.file instanceof File ? current.file : null);
		},
	});

	const current = files[0];
	const previewUrl = current?.preview ?? existingImageUrl ?? null;

	return (
		<div className="flex flex-col gap-2">
			<div
				className={cn(
					"flex w-full max-w-xs items-center gap-3 rounded-xl border border-dashed p-3 transition-colors",
					isDragging
						? "border-primary bg-primary/5"
						: "border-border hover:bg-muted/50",
				)}
			>
				<button
					type="button"
					onClick={openFileDialog}
					onDragEnter={handleDragEnter}
					onDragLeave={handleDragLeave}
					onDragOver={handleDragOver}
					onDrop={handleDrop}
					className="flex min-w-0 flex-1 items-center gap-3 text-left"
				>
					<div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
						{previewUrl ? (
							<img
								src={previewUrl}
								alt={alt}
								className="size-full object-cover"
							/>
						) : (
							<ImageIcon className="size-5 text-muted-foreground" />
						)}
					</div>
					<div className="flex min-w-0 flex-1 flex-col gap-0.5">
						<span className="truncate text-sm font-medium">
							{current
								? current.file.name
								: existingImageUrl
									? `Trocar ${label}`
									: `Selecionar ${label}`}
						</span>
						<span className="text-xs text-muted-foreground">
							PNG, JPG, WEBP ou SVG até {formatBytes(maxSize)}
						</span>
					</div>
				</button>
				{current ? (
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						onClick={() => {
							removeFile(current.id);
							onChange(null);
						}}
					>
						<XIcon />
					</Button>
				) : (
					<UploadIcon className="size-4 shrink-0 text-muted-foreground" />
				)}
			</div>
			<input {...getInputProps()} className="sr-only" />

			{errors.length > 0 && (
				<Alert variant="destructive">
					<CircleAlertIcon />
					<AlertTitle>{errors[0]}</AlertTitle>
				</Alert>
			)}
		</div>
	);
}
