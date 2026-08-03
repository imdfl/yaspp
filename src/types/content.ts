export enum ContentTypes {
	About = "about",
	Contact = "contact",
	Contrib = "contribute",
	Codex = "codex",
	Posts = "posts",
	Docs = "docs",
	Glossary = "glossary",
	Annotation = "annotations",
	Demo = "demo"
}

/** Types of dynamic content */
export enum DynamicContentTypes {
	Glossary = "glossary",
	Annotation = "annotation",
	/** Must remain an empty string, so it can be used in truthy/falsy tests */
	None = "",
}
