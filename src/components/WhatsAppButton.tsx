import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppButtonProps {
  phone: string;
  message?: string;
  className?: string;
  size?: "sm" | "default" | "lg";
  fullWidth?: boolean;
}

export function WhatsAppButton({ phone, message = '', className = '', size = 'default', fullWidth = false }: WhatsAppButtonProps) {
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${phone}${message ? `?text=${encodedMessage}` : ''}`;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={fullWidth ? 'w-full' : ''}>
      <Button
        className={`whatsapp-gradient text-whatsapp-foreground border-0 hover:opacity-90 ${fullWidth ? 'w-full' : ''} ${className}`}
        size={size}
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        WhatsApp
      </Button>
    </a>
  );
}
