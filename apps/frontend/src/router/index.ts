import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../pages/LoginPage.vue';
import ExamPage from '../pages/ExamPage.vue';

const routes = [
    { path: '/', name: 'login', component: LoginPage },
    { path: '/exam', name: 'exam', component: ExamPage },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Guard: redirect to login if no studentId
router.beforeEach((to) => {
    if (to.name === 'exam' && !sessionStorage.getItem('studentId')) {
        return { name: 'login' };
    }
});
