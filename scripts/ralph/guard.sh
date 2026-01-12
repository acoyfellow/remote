#!/usr/bin/env bash
set -euo pipefail

constraints_file="${1:-}"

if [[ -z "${constraints_file}" ]]; then
  echo "Usage: $0 <constraints.json>" >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required for guard checks" >&2
  exit 1
fi

if [[ ! -f "${constraints_file}" ]]; then
  echo "Constraints file not found: ${constraints_file}" >&2
  exit 1
fi

if grep -Eq "^[[:space:]-]*PAUSED:[[:space:]]*true" AGENTS.md; then
  echo "Guard blocked: AGENTS.md is paused" >&2
  exit 1
fi

max_files=$(jq -r '.maxFilesChanged // 0' "${constraints_file}")
max_lines=$(jq -r '.maxLinesChanged // 0' "${constraints_file}")
require_progress=$(jq -r '.requireProgressUpdate // false' "${constraints_file}")
readarray -t forbidden_paths < <(jq -r '.forbiddenPaths[]?' "${constraints_file}")

files_changed=$(git diff --name-only)

if [[ -z "${files_changed}" ]]; then
  echo "Guard note: no changes detected; nothing to validate."
  exit 0
fi

readarray -t changed_list <<< "${files_changed}"

file_count=$(echo "${files_changed}" | wc -l | tr -d ' ')
if [[ "${max_files}" -gt 0 && "${file_count}" -gt "${max_files}" ]]; then
  echo "Guard failed: ${file_count} files changed (max ${max_files})." >&2
  exit 1
fi

line_total=$(git diff --numstat | awk '{add+=$1; del+=$2} END {total=add+del; if (total=="") print 0; else print total}')
if [[ "${max_lines}" -gt 0 && "${line_total}" -gt "${max_lines}" ]]; then
  echo "Guard failed: ${line_total} total line changes (max ${max_lines})." >&2
  exit 1
fi

if [[ ${#forbidden_paths[@]} -gt 0 ]]; then
  for file in "${changed_list[@]}"; do
    for path in "${forbidden_paths[@]}"; do
      [[ -z "${path}" ]] && continue
      if [[ "${file}" == "${path}" || "${file}" == "${path}/"* ]]; then
        echo "Guard failed: forbidden path touched (${path})." >&2
        exit 1
      fi
    done
  done
fi

if [[ "${require_progress}" == "true" ]]; then
  prd_changed=$(echo "${files_changed}" | grep -c "scripts/ralph/prd.json" || true)
  progress_changed=$(echo "${files_changed}" | grep -c "scripts/ralph/progress.txt" || true)
  if [[ "${prd_changed}" -gt 0 && "${progress_changed}" -eq 0 ]]; then
    echo "Guard failed: prd.json changed without updating progress.txt." >&2
    exit 1
  fi
fi

echo "Guard passed: constraints satisfied."
