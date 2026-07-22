import { CircleAlertIcon, CropIcon, ImageIcon, XIcon } from "lucide-react";
import * as React from "react";
import ReactCrop, {
	type Crop,
	centerCrop,
	makeAspectCrop,
	type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Alert, AlertTitle } from "@/components/reui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload";
import { cn } from "@/lib/utils";

const DEFAULT_MAX_SIZE = 2 * 1024 * 1024;
const DEFAULT_ACCEPT = "image/png,image/jpeg,image/webp";

interface AvatarImageUploadProps {
	onChange: (file: File | null) => void;
	existingImageUrl?: string | null;
	alt: string;
	label?: string;
	accept?: string;
	maxSize?: number;
}

function centerSquareCrop(width: number, height: number): Crop {
	return centerCrop(
		makeAspectCrop({ unit: "%", width: 90 }, 1, width, height),
		width,
		height,
	);
}

function cropToFile(
	image: HTMLImageElement,
	crop: PixelCrop,
	fileName: string,
	fileType: string,
): Promise<File> {
	const canvas = document.createElement("canvas");
	const scaleX = image.naturalWidth / image.width;
	const scaleY = image.naturalHeight / image.height;

	canvas.width = crop.width * scaleX;
	canvas.height = crop.height * scaleY;

	const ctx = canvas.getContext("2d");
	ctx?.drawImage(
		image,
		crop.x * scaleX,
		crop.y * scaleY,
		crop.width * scaleX,
		crop.height * scaleY,
		0,
		0,
		canvas.width,
		canvas.height,
	);

	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (!blob) {
				reject(new Error("Falha ao recortar a imagem."));
				return;
			}
			resolve(new File([blob], fileName, { type: fileType }));
		}, fileType);
	});
}

export function AvatarImageUpload({
	onChange,
	existingImageUrl,
	alt,
	label = "imagem",
	accept = DEFAULT_ACCEPT,
	maxSize = DEFAULT_MAX_SIZE,
}: AvatarImageUploadProps) {
	const imgRef = React.useRef<HTMLImageElement | null>(null);
	const [crop, setCrop] = React.useState<Crop>();
	const [completedCrop, setCompletedCrop] = React.useState<PixelCrop>();
	const [croppedPreview, setCroppedPreview] = React.useState<string | null>(
		null,
	);

	const [{ files, isDragging, errors }, actions] = useFileUpload({
		accept,
		maxSize,
		multiple: false,
		onFilesChange: (newFiles) => {
			if (newFiles[0]?.file instanceof File) {
				setCrop(undefined);
				setCompletedCrop(undefined);
			}
		},
	});

	const pendingFile = files[0];
	const cropDialogOpen = pendingFile?.file instanceof File;
	const previewUrl = croppedPreview ?? existingImageUrl ?? null;

	function handleCancelCrop() {
		if (pendingFile) actions.removeFile(pendingFile.id);
	}

	async function handleConfirmCrop() {
		if (
			!imgRef.current ||
			!completedCrop ||
			!(pendingFile?.file instanceof File)
		)
			return;

		const file = pendingFile.file;
		const cropped = await cropToFile(
			imgRef.current,
			completedCrop,
			file.name,
			file.type,
		);

		if (croppedPreview) URL.revokeObjectURL(croppedPreview);
		setCroppedPreview(URL.createObjectURL(cropped));
		onChange(cropped);
		actions.removeFile(pendingFile.id);
	}

	function handleRemove() {
		if (croppedPreview) URL.revokeObjectURL(croppedPreview);
		setCroppedPreview(null);
		onChange(null);
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={actions.openFileDialog}
					onDragEnter={actions.handleDragEnter}
					onDragLeave={actions.handleDragLeave}
					onDragOver={actions.handleDragOver}
					onDrop={actions.handleDrop}
					className="rounded-full"
				>
					<Avatar
						size="lg"
						className={cn(
							"size-16 cursor-pointer transition-colors",
							isDragging && "ring-2 ring-primary",
						)}
					>
						{previewUrl ? (
							<AvatarImage src={previewUrl} alt={alt} />
						) : (
							<AvatarFallback>
								<ImageIcon className="size-5 text-muted-foreground" />
							</AvatarFallback>
						)}
					</Avatar>
				</button>
				<div className="flex flex-col gap-1">
					<span className="text-sm font-medium">
						{previewUrl ? `Trocar ${label}` : `Selecionar ${label}`}
					</span>
					<span className="text-xs text-muted-foreground">
						PNG, JPG ou WEBP até {formatBytes(maxSize)}
					</span>
					{previewUrl && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="h-auto w-fit p-0 text-destructive hover:text-destructive"
							onClick={handleRemove}
						>
							<XIcon />
							Remover
						</Button>
					)}
				</div>
			</div>
			<input {...actions.getInputProps()} className="sr-only" />

			{errors.length > 0 && (
				<Alert variant="destructive">
					<CircleAlertIcon />
					<AlertTitle>{errors[0]}</AlertTitle>
				</Alert>
			)}

			<Dialog
				open={cropDialogOpen}
				onOpenChange={(next) => {
					if (!next) handleCancelCrop();
				}}
			>
				<DialogContent className="gap-4">
					<DialogHeader>
						<DialogTitle>Recortar {label}</DialogTitle>
					</DialogHeader>

					{pendingFile?.preview && (
						<ReactCrop
							crop={crop}
							onChange={(_, percentCrop) => setCrop(percentCrop)}
							onComplete={setCompletedCrop}
							aspect={1}
							circularCrop
						>
							<img
								ref={imgRef}
								src={pendingFile.preview}
								alt={alt}
								onLoad={(event) => {
									const { width, height } = event.currentTarget;
									setCrop(centerSquareCrop(width, height));
								}}
							/>
						</ReactCrop>
					)}

					<DialogFooter>
						<Button type="button" variant="outline" onClick={handleCancelCrop}>
							Cancelar
						</Button>
						<Button type="button" onClick={handleConfirmCrop}>
							<CropIcon />
							Recortar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
