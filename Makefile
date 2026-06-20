SHELL := /bin/bash
.PHONY: help schemas validate-fixtures schema-drift-check clean-generated install-schema-tools

help:
	@echo "SentinelMesh — schema bundle tooling"
	@echo ""
	@echo "Targets:"
	@echo "  make install-schema-tools  Install quicktype, datamodel-code-generator, ajv via the project's pinned versions"
	@echo "  make schemas               Regenerate docs/types.ts and docs/models.py from docs/schemas/"
	@echo "  make validate-fixtures     Run ajv against every file under docs/schemas/fixtures/{valid,invalid}/"
	@echo "  make schema-drift-check    Regenerate types.ts/models.py and fail if anything changed (used in CI)"
	@echo "  make clean-generated       Remove generated artifacts"

install-schema-tools:
	cd tools && npm install
	python3 -m pip install --user 'datamodel-code-generator[http]==0.25.6'

schemas:
	@echo ">> Bundling all schemas (resolving cross-file \$$refs) -> tools/.bundled.schema.json"
	cd tools && node bundle-schemas.mjs .bundled.schema.json
	@echo ">> Generating docs/types.ts via quicktype..."
	cd tools && ./node_modules/.bin/quicktype \
	  --src-lang schema \
	  --lang ts \
	  --just-types \
	  --no-enums \
	  --no-combine-classes \
	  --prefer-const-values \
	  --explicit-unions \
	  --acronym-style original \
	  --top-level SentinelMeshMessage \
	  -o ../docs/types.ts \
	  .bundled.schema.json
	@echo ">> Generating docs/models.py via datamodel-code-generator..."
	@rm -f docs/models.py
	python3 -m datamodel_code_generator \
	  --input tools/.bundled.schema.json \
	  --input-file-type jsonschema \
	  --output docs/models.py \
	  --output-model-type pydantic_v2.BaseModel \
	  --target-python-version 3.11 \
	  --use-double-quotes \
	  --use-schema-description \
	  --field-constraints \
	  --use-standard-collections \
	  --reuse-model \
	  --collapse-root-models \
	  --disable-timestamp \
	  --class-name SentinelMeshMessage
	@rm -f tools/.bundled.schema.json
	@echo ">> Done. Review the diff with: git diff docs/types.ts docs/models.py"

validate-fixtures:
	cd tools && node validate-fixtures.mjs

schema-drift-check:
	@echo ">> Snapshotting current generated artifacts..."
	@cp docs/types.ts /tmp/sentinelmesh.types.ts.before
	@cp docs/models.py /tmp/sentinelmesh.models.py.before
	@$(MAKE) schemas
	@echo ">> Diffing..."
	@if ! diff -q /tmp/sentinelmesh.types.ts.before docs/types.ts > /dev/null; then \
	  echo "FAIL: docs/types.ts is out of sync with docs/schemas/. Run 'make schemas' and commit." ; \
	  diff /tmp/sentinelmesh.types.ts.before docs/types.ts | head -50 ; \
	  exit 1 ; \
	fi
	@if ! diff -q /tmp/sentinelmesh.models.py.before docs/models.py > /dev/null; then \
	  echo "FAIL: docs/models.py is out of sync with docs/schemas/. Run 'make schemas' and commit." ; \
	  diff /tmp/sentinelmesh.models.py.before docs/models.py | head -50 ; \
	  exit 1 ; \
	fi
	@echo ">> OK: generated artifacts match schemas/"

clean-generated:
	rm -f docs/types.ts docs/models.py
