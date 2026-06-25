import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';
import { useDynamicTheme } from '@/hooks/use-dynamic-theme';

export default function AuthLayout({
    children,
    title,
    description,
    ...props
}: {
    children: React.ReactNode;
    title: string;
    description: string;
}) {
    useDynamicTheme();
    return (
        <AuthLayoutTemplate title={title} description={description} {...props}>
            {children}
        </AuthLayoutTemplate>
    );
}
