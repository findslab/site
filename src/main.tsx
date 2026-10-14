import ReactDOM from 'react-dom/client';
import {BrowserRouter} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import Modal from "@/components/atoms/modal";
import Alert from "@/components/atoms/alert";
import Snackbar from "@/components/atoms/snackbar";
import {App} from "@/pages/app";
import {initBannerPan} from "@/utils/bannerPan";

// 도메인 설정
const PRIMARY_DOMAIN = 'findslab.github.io';
const FALLBACK_URL = 'https://findslab.github.io/site';

// 현재 도메인 체크 및 basename 결정
const currentHost = window.location.hostname;
const isCustomDomain = currentHost === PRIMARY_DOMAIN || currentHost === `www.${PRIMARY_DOMAIN}`;
const isGitHubPages = currentHost.endsWith('.github.io');

// GitHub Pages에서 /site 경로 사용, 커스텀 도메인은 루트 사용
const basename = isGitHubPages ? '/site' : '/';

// 커스텀 도메인 접속 실패 시 GitHub Pages로 우회 (선택적)
// 이 기능은 DNS 문제 등으로 커스텀 도메인이 안될 때 사용자가 수동으로 우회할 수 있게 함
if (typeof window !== 'undefined') {
  (window as any).FINDS_LAB_CONFIG = {
    primaryDomain: PRIMARY_DOMAIN,
    fallbackUrl: FALLBACK_URL,
    isCustomDomain,
    redirectToFallback: () => {
      window.location.href = FALLBACK_URL + window.location.pathname;
    }
  };
}

const queryClient = new QueryClient({
  defaultOptions: {queries: {refetchOnWindowFocus: false, retryOnMount: true, refetchOnReconnect: false, retry: false}},
});

initBannerPan();
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <BrowserRouter basename={basename}>
    <QueryClientProvider client={queryClient}>
      <App/>
      <Modal/>
      <Alert/>
      <Snackbar/>
    </QueryClientProvider>
  </BrowserRouter>
);
