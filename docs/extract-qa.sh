#!/bin/bash
# Extract Q&A pairs from all MDX files into a structured format
# Output: JSON array of { module, topic, question, answer }

cd /home/hicooper/projects/interview-learning/docs/content/docs

echo "["

for f in $(find . -name "*.mdx" -not -name "index.mdx" | sort); do
  module=$(echo "$f" | cut -d'/' -f2)
  filename=$(basename "$f" .mdx)
  
  # Extract title from frontmatter
  title=$(grep "^title:" "$f" | head -1 | sed 's/^title: //' | sed 's/"//g')
  
  # Extract Q&A pairs from 自测 section
  # Each Q&A: numbered item with **question** followed by answer line with <br/>→
  awk -v module="$module" -v topic="$title" -v file="$filename" '
  /^## 自测/ { inQA=1; next }
  inQA && /^[0-9]+\./ { 
    # Flush previous
    if (question != "") {
      gsub(/"/, "\\\"", question)
      gsub(/"/, "\\\"", answer)
      printf "  {\"module\":\"%s\",\"topic\":\"%s\",\"id\":\"%s-q%d\",\"question\":\"%s\",\"answer\":\"%s\"},\n", module, topic, file, qnum, question, answer
    }
    qnum++
    # Extract question text (between ** **)
    line = $0
    gsub(/^[0-9]+\.\s*\*\*/, "", line)
    if (match(line, /\*\*/)) {
      question = substr(line, 1, RSTART-1)
    } else {
      question = line
    }
    gsub(/^[[:space:]]+|[[:space:]]+$/, "", question)
    answer = ""
    next
  }
  inQA && /<br\/>→/ {
    # Extract answer (remove <br/>→ prefix)
    line = $0
    sub(/.*<br\/>→[[:space:]]*/, "", line)
    gsub(/^[[:space:]]+|[[:space:]]+$/, "", line)
    if (answer == "") answer = line
    else answer = answer "\\n" line
    next
  }
  inQA && answer != "" && /^$/ { next }
  inQA && answer != "" && !/^[0-9]+\./ && !/<br\/>→/ {
    # Continuation line
    line = $0
    gsub(/^[[:space:]]+|[[:space:]]+$/, "", line)
    if (line != "") answer = answer "\\n" line
  }
  END {
    if (question != "") {
      gsub(/"/, "\\\"", question)
      gsub(/"/, "\\\"", answer)
      printf "  {\"module\":\"%s\",\"topic\":\"%s\",\"id\":\"%s-q%d\",\"question\":\"%s\",\"answer\":\"%s\"},\n", module, topic, file, qnum, question, answer
    }
  }
  ' "$f"
done

echo "]"
