-- AlterTable
ALTER TABLE "Post" ADD COLUMN "indexed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Post" ADD COLUMN "searchVector" tsvector;

-- CreateIndex
CREATE INDEX "Post_searchVector_idx" ON "Post" USING GIN ("searchVector");

-- Function to generate search vector from Post.text and author handle
CREATE OR REPLACE FUNCTION post_search_vector_update() RETURNS trigger AS $$
BEGIN
  -- Get the author handle
  DECLARE author_handle TEXT;
  BEGIN
    IF NEW."authorId" IS NOT NULL THEN
      SELECT "handle" INTO author_handle FROM "User" WHERE "id" = NEW."authorId";
    ELSIF NEW."remoteAuthorId" IS NOT NULL THEN
      SELECT "handle" INTO author_handle FROM "RemoteUser" WHERE "id" = NEW."remoteAuthorId";
    ELSE
      author_handle := '';
    END IF;
  END;

  -- Create weighted vector (A for handle, B for text)
  NEW."searchVector" := 
    setweight(to_tsvector('english', COALESCE(author_handle, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.text, '')), 'B');
  
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vector on insert/update
CREATE TRIGGER post_search_vector_trigger
  BEFORE INSERT OR UPDATE ON "Post"
  FOR EACH ROW
  WHEN (NEW."indexed" = true)
  EXECUTE FUNCTION post_search_vector_update(); 