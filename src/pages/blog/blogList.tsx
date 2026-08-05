import {
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Search,
  MoreHorizontal,
  FileText,
  Eye,
  Pencil,
  Trash2,
  Send,
  Archive,
  RefreshCw,
  Calendar,
  Tag,
  User,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useBlogList } from "./hooks/useBlogList";
import { IBlogPost } from "./interface";
import { useEffect, useState } from "react";
import { Input } from "../../components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import useRoleCheck from "../auth/hooks/useRoleCheck";

const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Draft", variant: "secondary" },
  published: { label: "Published", variant: "default" },
  archived: { label: "Archived", variant: "outline" },
};

const BlogList = () => {
  const navigate = useNavigate();
  const { hasRequiredPermission } = useRoleCheck();
  const {
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
  } = useBlogList();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<IBlogPost | null>(null);

  const confirmDelete = async () => {
    if (postToDelete) {
      await handleDelete(postToDelete._id);
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  const canCreate = hasRequiredPermission("Blog", "create");
  const canEdit = hasRequiredPermission("Blog", "edit");
  const canDelete = hasRequiredPermission("Blog", "delete");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Blog Posts</h2>
          <p className="text-muted-foreground">
            Manage your blog content and SEO settings
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => navigate("/blog/create")} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            New Post
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={refreshList}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Views</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableHead key={j}>
                      <div className="h-4 bg-muted animate-pulse rounded" />
                    </TableHead>
                  ))}
                </TableRow>
              ))
            ) : posts.length === 0 ? (
              <TableRow>
                <TableHead colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FileText className="h-8 w-8" />
                    <p>No blog posts found</p>
                    {canCreate && (
                      <Button
                        variant="link"
                        onClick={() => navigate("/blog/create")}
                      >
                        Create your first post
                      </Button>
                    )}
                  </div>
                </TableHead>
              </TableRow>
            ) : (
              posts.map((post) => {
                const category = categories.find(
                  (c) => c.id === post.categoryId
                );
                const status = statusConfig[post.status] || statusConfig.draft;
                return (
                  <TableRow key={post._id}>
                    <TableHead>
                      <div className="flex items-center gap-3">
                        {post.featuredImage ? (
                          <img
                            src={post.featuredImage}
                            alt=""
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[250px]">
                            {post.title}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {post.authorName}
                          </p>
                        </div>
                      </div>
                    </TableHead>
                    <TableHead>
                      {category ? (
                        <Badge variant="secondary">{category.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableHead>
                    <TableHead>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableHead>
                    <TableHead className="text-center">
                      <span className="flex items-center justify-center gap-1 text-sm">
                        <Eye className="h-3 w-3" />
                        {post.views || 0}
                      </span>
                    </TableHead>
                    <TableHead>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.publishedAt)}
                      </span>
                    </TableHead>
                    <TableHead className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canEdit && (
                            <DropdownMenuItem
                              onClick={() => navigate(`/blog/edit/${post._id}`)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {canEdit && post.status !== "published" && (
                            <DropdownMenuItem
                              onClick={() => handlePublish(post._id)}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Publish
                            </DropdownMenuItem>
                          )}
                          {canEdit && post.status !== "archived" && (
                            <DropdownMenuItem
                              onClick={() => handleArchive(post._id)}
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          {canDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setPostToDelete(post);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPageNum - 1) * limit + 1} to{" "}
            {Math.min(currentPageNum * limit, pagination.total)} of{" "}
            {pagination.total} posts
          </p>
          <div className="flex items-center gap-2">
            <Select
              value={String(limit)}
              onValueChange={(v) => setLimit(Number(v))}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPageNum <= 1}
              onClick={() => setCurrentPage(currentPageNum - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Page {currentPageNum} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={currentPageNum >= pagination.pages}
              onClick={() => setCurrentPage(currentPageNum + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{postToDelete?.title}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setPostToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogList;
