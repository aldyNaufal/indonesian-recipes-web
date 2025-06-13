import useBookmarkPresenter from '../presenters/BookmarkPresenter';
import BookmarkView from '../views/BookmarkView';

export default function BookmarkPage() {
  const presenter = useBookmarkPresenter();
  return <BookmarkView presenter={presenter} />;
}
