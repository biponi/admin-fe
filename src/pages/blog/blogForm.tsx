import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Trash2,
  Sparkles,
  FileText,
  HelpCircle,
  ListOrdered,
  Lightbulb,
  Globe,
  Send,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { useRef, useState, useEffect, useCallback } from "react";
import TiptapEditor from "../../components/ui/tiptap";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import { Badge } from "../../components/ui/badge";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../components/ui/use-toast";
import PlaceHolderImage from "../../assets/placeholder.svg";
import {
  IBlogPost,
  IBlogFormData,
  IBlogCategory,
  IBlogFaq,
  IBlogHowToStep,
  IKeywordSuggestion,
} from "./interface";
import {
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  getBlogCategories,
  suggestBlogKeywords,
} from "../../api/blog";

const defaultFormData: IBlogFormData = {
  title: "",
  content: "",
  excerpt: "",
  categoryId: "",
  tags: [],
  status: "draft",
  seoTitle: "",
  seoDescription: "",
  seoKeywords: [],
  focusKeyword: "",
  metaRobots: "index, follow",
  canonicalUrl: "",
  faqs: [],
  howToSteps: [],
  keyTakeaways: [],
};

const BlogForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { toast } = useToast();

  const [formData, setFormData] = useState<IBlogFormData>(defaultFormData);
  const [categories, setCategories] = useState<IBlogCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [keywordLoading, setKeywordLoading] = useState(false);
  const [keywordSuggestions, setKeywordSuggestions] =
    useState<IKeywordSuggestion | null>(null);

  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [faqInput, setFaqInput] = useState({ question: "", answer: "" });
  const [stepInput, setStepInput] = useState({ name: "", text: "" });
  const [takeawayInput, setTakeawayInput] = useState("");

  const featuredImageRef = useRef<HTMLInputElement>(null);

  // Load categories and existing post data
  useEffect(() => {
    loadCategories();
    if (isEdit && id) loadPost(id);
  }, [id, isEdit]);

  const loadCategories = async () => {
    const response = await getBlogCategories();
    if (response?.success && response?.data) {
      setCategories(response.data);
    }
  };

  const loadPost = async (postId: string) => {
    setLoading(true);
    const response = await getBlogPostById(postId);
    if (response?.success && response?.data) {
      const post: IBlogPost = response.data;
      setFormData({
        title: post.title || "",
        content: post.content || "",
        excerpt: post.excerpt || "",
        categoryId: post.categoryId || "",
        tags: post.tags || [],
        status: post.status || "draft",
        seoTitle: post.seoTitle || "",
        seoDescription: post.seoDescription || "",
        seoKeywords: post.seoKeywords || [],
        focusKeyword: post.focusKeyword || "",
        metaRobots: post.metaRobots || "index, follow",
        canonicalUrl: post.canonicalUrl || "",
        faqs: post.faqs || [],
        howToSteps: post.howToSteps || [],
        keyTakeaways: post.keyTakeaways || [],
      });
      if (post.featuredImage) {
        setFeaturedImagePreview(post.featuredImage);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: response?.error || "Failed to load post",
      });
      navigate("/blog");
    }
    setLoading(false);
  };

  const updateField = <K extends keyof IBlogFormData>(
    field: K,
    value: IBlogFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Featured image handling
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImageFile(file);
      setFeaturedImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setFeaturedImageFile(null);
    setFeaturedImagePreview("");
    if (featuredImageRef.current) featuredImageRef.current.value = "";
  };

  // Tag management
  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      updateField("tags", [...formData.tags, tag]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    updateField(
      "tags",
      formData.tags.filter((t) => t !== tag)
    );
  };

  // FAQ management
  const addFaq = () => {
    if (faqInput.question.trim() && faqInput.answer.trim()) {
      updateField("faqs", [...formData.faqs, { ...faqInput }]);
      setFaqInput({ question: "", answer: "" });
    }
  };

  const removeFaq = (index: number) => {
    updateField(
      "faqs",
      formData.faqs.filter((_, i) => i !== index)
    );
  };

  // HowTo step management
  const addStep = () => {
    if (stepInput.name.trim() && stepInput.text.trim()) {
      updateField("howToSteps", [
        ...formData.howToSteps,
        { ...stepInput, image: "" },
      ]);
      setStepInput({ name: "", text: "" });
    }
  };

  const removeStep = (index: number) => {
    updateField(
      "howToSteps",
      formData.howToSteps.filter((_, i) => i !== index)
    );
  };

  // Key takeaway management
  const addTakeaway = () => {
    if (takeawayInput.trim()) {
      updateField("keyTakeaways", [...formData.keyTakeaways, takeawayInput.trim()]);
      setTakeawayInput("");
    }
  };

  const removeTakeaway = (index: number) => {
    updateField(
      "keyTakeaways",
      formData.keyTakeaways.filter((_, i) => i !== index)
    );
  };

  // SEO keyword suggestion
  const handleKeywordSuggestion = async () => {
    if (!formData.title || !formData.content) {
      toast({
        variant: "destructive",
        title: "Missing content",
        description: "Please add a title and content first",
      });
      return;
    }
    setKeywordLoading(true);
    const response = await suggestBlogKeywords({
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt,
    });
    if (response?.success && response?.data) {
      setKeywordSuggestions(response.data);
      toast({ title: "Keywords suggested successfully" });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: response?.error || "Failed to suggest keywords",
      });
    }
    setKeywordLoading(false);
  };

  const applySuggestions = () => {
    if (!keywordSuggestions) return;
    if (!formData.seoTitle && keywordSuggestions.seoTitle) {
      updateField("seoTitle", keywordSuggestions.seoTitle);
    }
    if (!formData.seoDescription && keywordSuggestions.seoDescription) {
      updateField("seoDescription", keywordSuggestions.seoDescription);
    }
    if (!formData.focusKeyword && keywordSuggestions.focusKeyword) {
      updateField("focusKeyword", keywordSuggestions.focusKeyword);
    }
    if (keywordSuggestions.suggestedKeywords.length > 0) {
      const newKeywords = keywordSuggestions.suggestedKeywords.filter(
        (k) => !formData.seoKeywords.includes(k)
      );
      updateField("seoKeywords", [...formData.seoKeywords, ...newKeywords]);
    }
    toast({ title: "Suggestions applied to SEO fields" });
  };

  // Form submission
  const handleSubmit = async (status?: "draft" | "published") => {
    if (!formData.title.trim()) {
      toast({ variant: "destructive", title: "Title is required" });
      return;
    }
    if (!formData.content.trim() || formData.content.trim().length < 50) {
      toast({
        variant: "destructive",
        title: "Content must be at least 50 characters",
      });
      return;
    }
    if (!formData.categoryId) {
      toast({ variant: "destructive", title: "Category is required" });
      return;
    }

    setSaving(true);
    const submitData = new FormData();
    const finalStatus = status || formData.status;

    submitData.append("title", formData.title);
    submitData.append("content", formData.content);
    submitData.append("excerpt", formData.excerpt);
    submitData.append("categoryId", formData.categoryId);
    submitData.append("status", finalStatus);
    submitData.append("seoTitle", formData.seoTitle);
    submitData.append("seoDescription", formData.seoDescription);
    submitData.append("focusKeyword", formData.focusKeyword);
    submitData.append("metaRobots", formData.metaRobots);
    submitData.append("canonicalUrl", formData.canonicalUrl);

    if (formData.tags.length > 0) {
      submitData.append("tags", JSON.stringify(formData.tags));
    }
    if (formData.seoKeywords.length > 0) {
      submitData.append("seoKeywords", JSON.stringify(formData.seoKeywords));
    }
    if (formData.faqs.length > 0) {
      submitData.append("faqs", JSON.stringify(formData.faqs));
    }
    if (formData.howToSteps.length > 0) {
      submitData.append("howToSteps", JSON.stringify(formData.howToSteps));
    }
    if (formData.keyTakeaways.length > 0) {
      submitData.append(
        "keyTakeaways",
        JSON.stringify(formData.keyTakeaways)
      );
    }

    if (featuredImageFile) {
      submitData.append("featuredImage", featuredImageFile);
    }

    let response;
    if (isEdit && id) {
      response = await updateBlogPost(id, submitData);
    } else {
      response = await createBlogPost(submitData);
    }

    if (response?.success) {
      toast({
        title: isEdit ? "Post updated successfully" : "Post created successfully",
      });
      navigate("/blog");
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: response?.error || "Failed to save post",
      });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/blog")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {isEdit ? "Edit Blog Post" : "Create Blog Post"}
            </h2>
            <p className="text-muted-foreground">
              {isEdit
                ? "Update your blog post and SEO settings"
                : "Write a new blog post with SEO optimization"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit("draft")}
            disabled={saving}
          >
            Save as Draft
          </Button>
          <Button onClick={() => handleSubmit("published")} disabled={saving}>
            <Send className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content" className="gap-2">
            <FileText className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Globe className="h-4 w-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="ai-seo" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI / GEO
          </TabsTrigger>
        </TabsList>

        {/* ── Content Tab ─────────────────────────────────────────────── */}
        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Post Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter post title..."
                      value={formData.title}
                      onChange={(e) => updateField("title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Content *</Label>
                    <TiptapEditor
                      content={formData.content}
                      onChange={(content) => updateField("content", content)}
                      placeholder="Write your blog post content..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Featured Image */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Featured Image</CardTitle>
                </CardHeader>
                <CardContent>
                  {featuredImagePreview ? (
                    <div className="relative">
                      <img
                        src={featuredImagePreview}
                        alt="Featured"
                        className="w-full h-40 object-cover rounded"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={removeImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="w-full h-40 border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => featuredImageRef.current?.click()}
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload
                      </p>
                    </div>
                  )}
                  <input
                    ref={featuredImageRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </CardContent>
              </Card>

              {/* Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Category *</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(v) => updateField("categoryId", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    />
                    <Button variant="outline" size="icon" onClick={addTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button onClick={() => removeTag(tag)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Excerpt */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Excerpt</CardTitle>
                  <CardDescription>
                    Short summary (auto-generated if empty)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Brief summary of the post..."
                    value={formData.excerpt}
                    onChange={(e) => updateField("excerpt", e.target.value)}
                    rows={3}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── SEO Tab ─────────────────────────────────────────────────── */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Search Engine Optimization</CardTitle>
                  <CardDescription>
                    Optimize how this post appears in search results
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={handleKeywordSuggestion}
                  disabled={keywordLoading}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {keywordLoading ? "Suggesting..." : "Suggest Keywords"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* SEO Title */}
              <div className="space-y-2">
                <Label>SEO Title</Label>
                <Input
                  placeholder="SEO title for search engines..."
                  value={formData.seoTitle}
                  onChange={(e) => updateField("seoTitle", e.target.value)}
                  maxLength={70}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.seoTitle.length}/70 characters
                </p>
              </div>

              {/* SEO Description */}
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea
                  placeholder="Search engine description..."
                  value={formData.seoDescription}
                  onChange={(e) =>
                    updateField("seoDescription", e.target.value)
                  }
                  maxLength={160}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.seoDescription.length}/160 characters
                </p>
              </div>

              {/* Focus Keyword */}
              <div className="space-y-2">
                <Label>Focus Keyword</Label>
                <Input
                  placeholder="Primary keyword for this post..."
                  value={formData.focusKeyword}
                  onChange={(e) =>
                    updateField("focusKeyword", e.target.value)
                  }
                />
              </div>

              {/* SEO Keywords */}
              <div className="space-y-2">
                <Label>SEO Keywords</Label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {formData.seoKeywords.map((kw) => (
                    <Badge key={kw} variant="secondary" className="gap-1">
                      {kw}
                      <button
                        onClick={() =>
                          updateField(
                            "seoKeywords",
                            formData.seoKeywords.filter((k) => k !== kw)
                          )
                        }
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Keyword Suggestions */}
              {keywordSuggestions && (
                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Suggested Keywords
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {keywordSuggestions.suggestedKeywords.map((kw) => (
                        <Badge
                          key={kw}
                          variant={
                            formData.seoKeywords.includes(kw)
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() => {
                            if (!formData.seoKeywords.includes(kw)) {
                              updateField("seoKeywords", [
                                ...formData.seoKeywords,
                                kw,
                              ]);
                            }
                          }}
                        >
                          {kw}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="link"
                      className="p-0 h-auto"
                      onClick={applySuggestions}
                    >
                      Apply all suggestions to SEO fields
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Meta Robots */}
              <div className="space-y-2">
                <Label>Meta Robots</Label>
                <Select
                  value={formData.metaRobots}
                  onValueChange={(v) => updateField("metaRobots", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="index, follow">
                      Index, Follow
                    </SelectItem>
                    <SelectItem value="noindex, follow">
                      No Index, Follow
                    </SelectItem>
                    <SelectItem value="index, nofollow">
                      Index, No Follow
                    </SelectItem>
                    <SelectItem value="noindex, nofollow">
                      No Index, No Follow
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Canonical URL */}
              <div className="space-y-2">
                <Label>Canonical URL</Label>
                <Input
                  placeholder="https://example.com/blog/custom-slug (optional)"
                  value={formData.canonicalUrl}
                  onChange={(e) =>
                    updateField("canonicalUrl", e.target.value)
                  }
                />
              </div>

              {/* SEO Preview */}
              <Card className="bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Search Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-blue-600 text-lg font-medium truncate">
                      {formData.seoTitle || formData.title || "Page Title"}
                    </p>
                    <p className="text-green-700 text-sm truncate">
                      {formData.canonicalUrl ||
                        `https://yourdomain.com/blog/${formData.title
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                          .replace(/[^a-z0-9-]/g, "")}`}
                    </p>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {formData.seoDescription ||
                        formData.excerpt ||
                        "Post description will appear here..."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── AI / GEO Tab ────────────────────────────────────────────── */}
        <TabsContent value="ai-seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI & Generative Engine Optimization</CardTitle>
              <CardDescription>
                Structured data that helps AI systems (Google AI Overviews,
                ChatGPT, Claude) understand and cite your content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Key Takeaways */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  <Label className="text-base font-semibold">
                    Key Takeaways
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Summarize the main points — AI systems use these for quick
                  answers
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a key takeaway..."
                    value={takeawayInput}
                    onChange={(e) => setTakeawayInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTakeaway())
                    }
                  />
                  <Button variant="outline" size="icon" onClick={addTakeaway}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.keyTakeaways.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline" className="shrink-0">
                        {index + 1}
                      </Badge>
                      <span className="text-sm flex-1">{item}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeTakeaway(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQs */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  <Label className="text-base font-semibold">
                    Frequently Asked Questions
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Generates FAQPage schema — highest value for Answer Engine
                  Optimization
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input
                    placeholder="Question..."
                    value={faqInput.question}
                    onChange={(e) =>
                      setFaqInput({ ...faqInput, question: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Answer..."
                    value={faqInput.answer}
                    onChange={(e) =>
                      setFaqInput({ ...faqInput, answer: e.target.value })
                    }
                  />
                </div>
                <Button variant="outline" size="sm" onClick={addFaq}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add FAQ
                </Button>
                <div className="space-y-2">
                  {formData.faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-2 border rounded"
                    >
                      <HelpCircle className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{faq.question}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {faq.answer}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => removeFaq(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* HowTo Steps */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ListOrdered className="h-4 w-4" />
                  <Label className="text-base font-semibold">
                    How-To Steps
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Generates HowTo schema — great for tutorials and guides
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input
                    placeholder="Step name..."
                    value={stepInput.name}
                    onChange={(e) =>
                      setStepInput({ ...stepInput, name: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Step description..."
                    value={stepInput.text}
                    onChange={(e) =>
                      setStepInput({ ...stepInput, text: e.target.value })
                    }
                  />
                </div>
                <Button variant="outline" size="sm" onClick={addStep}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Step
                </Button>
                <div className="space-y-2">
                  {formData.howToSteps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-2 border rounded"
                    >
                      <Badge variant="outline" className="shrink-0 mt-0.5">
                        {index + 1}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{step.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {step.text}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => removeStep(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlogForm;
