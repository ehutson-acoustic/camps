import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {ApolloProviderWrapper} from "@/api";
import './index.css'
import {Router} from "@/router.tsx";
import {Toaster} from "@/components/ui/sonner";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ApolloProviderWrapper>
            <Router/>
        </ApolloProviderWrapper>
        <Toaster/>
    </StrictMode>,
);
