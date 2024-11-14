import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type ModalProps = {
    trigger: React.ReactNode;
    children: React.ReactNode;
    title: string;
    description: string;
    className?: string;
};

const Modal = ({ children, trigger, description, title, className }: ModalProps) => {
    return <Dialog>
        <DialogTrigger className={className} asChild>
            {trigger}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
};

export default Modal;
