import { useEffect, useRef, useState } from "react";
import { useToast } from "../../../components/ui/use-toast";
import {
  getBlogPosts,
  deleteBlogPost,
  publishBlogPost,
  archiveBlogPost,
  getBlogCategories,
} from "../../../api/blog";
import { IBlogPost, IBlogCategory, IBlogPagination } from "../interface";

export const useBlogList = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<IBlogPost[]>([]);
  const [categories, setCategories] = useState<IBlogCategory[]>([]);
  const [pagination, setPagination] = useState<IBlogPagination>({
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  });
  const [currentPageNum, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState(20);
  const totalPagesRef = useRef(0);

  const refreshList = () => {
    fetchPosts();
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line
  }, [currentPageNum]);

  useEffect(() => {
    if (currentPageNum !== 1) setCurrentPage(1);
    else fetchPosts();
    // eslint-disable-next-line
  }, [statusFilter, categoryFilter, limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPageNum !== 1) setCurrentPage(1);
      else fetchPosts();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [searchQuery]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const response = await getBlogPosts(
      limit,
      currentPageNum,
      statusFilter,
      categoryFilter,
      searchQuery
    );
    if (response?.success && response?.data) {
      const { posts: fetchedPosts, pagination: pag } = response.data;
      setPosts(fetchedPosts || []);
      setPagination(pag);
      totalPagesRef.current = pag?.pages || 0;
    } else {
      toast({
        variant: "destructive",
        title: "Blog Error",
        description: response?.error,
      });
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const response = await getBlogCategories();
    if (response?.success && response?.data) {
      setCategories(response.data || []);
    }
  };

  const handleDelete = async (id: string) => {
    const response = await deleteBlogPost(id);
    if (response?.success) {
      toast({ title: "Post deleted successfully" });
      refreshList();
    } else {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: response?.error,
      });
    }
  };

  const handlePublish = async (id: string) => {
    const response = await publishBlogPost(id);
    if (response?.success) {
      toast({ title: "Post published successfully" });
      refreshList();
    } else {
      toast({
        variant: "destructive",
        title: "Publish failed",
        description: response?.error,
      });
    }
  };

  const handleArchive = async (id: string) => {
    const response = await archiveBlogPost(id);
    if (response?.success) {
      toast({ title: "Post archived successfully" });
      refreshList();
    } else {
      toast({
        variant: "destructive",
        title: "Archive failed",
        description: response?.error,
      });
    }
  };

  return {
    loading,
    posts,
    categories,
    pagination,
    currentPageNum,
    statusFilter,
    categoryFilter,
    searchQuery,
    limit,
    setCurrentPage,
    setStatusFilter,
    setCategoryFilter,
    setSearchQuery,
    setLimit,
    refreshList,
    handleDelete,
    handlePublish,
    handleArchive,
  };
};
