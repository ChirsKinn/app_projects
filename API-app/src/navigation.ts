import { router } from 'expo-router';
import { Article } from './articles';

export function openArticle(article: Article) {
  router.push({ pathname: '/article', params: { data: JSON.stringify(article) } });
}
