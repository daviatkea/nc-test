function createValidationMiddleware({ router, sendError }) {
  function hasOwn(body, field) {
    return Object.prototype.hasOwnProperty.call(body, field);
  }

  function shouldValidate(body, field, mode) {
    return mode === "create" || hasOwn(body, field);
  }

  function addError(errors, field, message, code = "invalid") {
    errors.push({ field, message, code });
  }

  function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  function isValidDateString(value) {
    return typeof value === "string" && !Number.isNaN(Date.parse(value));
  }

  function isPositiveIntegerLike(value) {
    const parsedValue = Number(value);
    return Number.isInteger(parsedValue) && parsedValue > 0;
  }

  function isValidEmail(value) {
    return (
      typeof value === "string" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
    );
  }

  function isValidUrl(value) {
    if (typeof value !== "string") {
      return false;
    }

    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  function isValidRootRelativePath(value) {
    return (
      typeof value === "string" &&
      value.startsWith("/") &&
      !value.startsWith("//") &&
      !/[\s\\]/.test(value)
    );
  }

  function isValidAssetUrl(value) {
    return isValidUrl(value) || isValidRootRelativePath(value);
  }

  function parseResourceSegments(requestPath) {
    const [resource, id] = requestPath.split("/").filter(Boolean);
    if (id === undefined) {
      return { resource, id: undefined };
    }

    const numericId = Number(id);

    return {
      resource,
      id: Number.isNaN(numericId) ? id : numericId,
    };
  }

  function validateRequiredString(body, field, label, errors, mode) {
    if (!shouldValidate(body, field, mode)) {
      return;
    }

    if (!isNonEmptyString(body[field])) {
      addError(errors, field, `${label} must be a non-empty string.`);
    }
  }

  function validateRequiredDate(body, field, label, errors, mode) {
    if (!shouldValidate(body, field, mode)) {
      return;
    }

    if (!isValidDateString(body[field])) {
      addError(errors, field, `${label} must be a valid ISO date string.`);
    }
  }

  function validateRequiredEmail(body, field, label, errors, mode) {
    if (!shouldValidate(body, field, mode)) {
      return;
    }

    if (!isValidEmail(body[field])) {
      addError(errors, field, `${label} must be a valid email address.`);
    }
  }

  function validateRequiredPositiveInteger(body, field, label, errors, mode) {
    if (!shouldValidate(body, field, mode)) {
      return;
    }

    if (!isPositiveIntegerLike(body[field])) {
      addError(errors, field, `${label} must be a positive whole number.`);
    }
  }

  function validateRequiredAsset(body, field, label, errors, mode) {
    if (!shouldValidate(body, field, mode)) {
      return;
    }

    const asset = body[field];

    if (!asset || typeof asset !== "object" || Array.isArray(asset)) {
      addError(
        errors,
        `${field}.url`,
        `${label} must include a valid asset.url.`,
      );
      return;
    }

    if (!isValidAssetUrl(asset.url)) {
      addError(
        errors,
        `${field}.url`,
        `${label} asset.url must be a valid URL or root-relative path.`,
      );
    }
  }

  function validateOptionalUrl(body, field, label, errors) {
    if (!hasOwn(body, field) || body[field] === "" || body[field] == null) {
      return;
    }

    if (!isValidUrl(body[field])) {
      addError(errors, field, `${label} must be a valid URL.`);
    }
  }

  function blogpostExists(blogpostId) {
    return (
      router.db
        .get("blogposts")
        .find({ id: Number(blogpostId) })
        .value() != null
    );
  }

  function newsletterEmailExists(email, currentId) {
    const normalizedEmail = email.trim().toLowerCase();

    return (
      router.db
        .get("newsletters")
        .find(
          (item) =>
            typeof item.email === "string" &&
            item.email.trim().toLowerCase() === normalizedEmail &&
            item.id !== currentId,
        )
        .value() != null
    );
  }

  const validators = {
    events(body, mode) {
      const errors = [];

      validateRequiredString(body, "title", "title", errors, mode);
      validateRequiredString(body, "description", "description", errors, mode);
      validateRequiredDate(body, "date", "date", errors, mode);
      validateRequiredString(body, "location", "location", errors, mode);
      validateRequiredAsset(body, "asset", "asset", errors, mode);

      return errors;
    },
    blogposts(body, mode) {
      const errors = [];

      validateRequiredString(body, "title", "title", errors, mode);
      validateRequiredString(body, "author", "author", errors, mode);
      validateRequiredString(body, "content", "content", errors, mode);
      validateRequiredAsset(body, "asset", "asset", errors, mode);

      return errors;
    },
    comments(body, mode) {
      const errors = [];

      validateRequiredPositiveInteger(
        body,
        "blogpostId",
        "blogpostId",
        errors,
        mode,
      );
      if (
        shouldValidate(body, "blogpostId", mode) &&
        isPositiveIntegerLike(body.blogpostId)
      ) {
        if (!blogpostExists(body.blogpostId)) {
          addError(
            errors,
            "blogpostId",
            "blogpostId must reference an existing blog post.",
          );
        }
      }

      validateRequiredString(body, "name", "name", errors, mode);
      validateRequiredString(body, "content", "content", errors, mode);
      validateRequiredDate(body, "date", "date", errors, mode);

      return errors;
    },
    gallery(body, mode) {
      const errors = [];

      validateRequiredString(body, "description", "description", errors, mode);
      validateRequiredAsset(body, "asset", "asset", errors, mode);

      return errors;
    },
    testimonials(body, mode) {
      const errors = [];

      validateRequiredString(body, "name", "name", errors, mode);
      validateRequiredString(body, "content", "content", errors, mode);
      validateRequiredAsset(body, "asset", "asset", errors, mode);
      validateOptionalUrl(body, "facebook", "facebook", errors);
      validateOptionalUrl(body, "twitter", "twitter", errors);

      return errors;
    },
    contact_messages(body, mode) {
      const errors = [];

      validateRequiredString(body, "name", "name", errors, mode);
      validateRequiredEmail(body, "email", "email", errors, mode);
      validateRequiredString(body, "content", "content", errors, mode);
      validateRequiredDate(body, "date", "date", errors, mode);

      return errors;
    },
    reservations(body, mode) {
      const errors = [];

      validateRequiredString(body, "name", "name", errors, mode);
      validateRequiredEmail(body, "email", "email", errors, mode);
      validateRequiredPositiveInteger(body, "table", "table", errors, mode);
      validateRequiredPositiveInteger(body, "guests", "guests", errors, mode);
      validateRequiredDate(body, "date", "date", errors, mode);
      validateRequiredString(body, "phone", "phone", errors, mode);

      return errors;
    },
    newsletters(body, mode, resourceId) {
      const errors = [];

      validateRequiredEmail(body, "email", "email", errors, mode);
      if (shouldValidate(body, "email", mode) && isValidEmail(body.email)) {
        if (newsletterEmailExists(body.email, resourceId)) {
          addError(
            errors,
            "email",
            "This email address is already subscribed to the newsletter.",
            "conflict",
          );
        }
      }

      return errors;
    },
  };

  return function validationMiddleware(req, res, next) {
    if (!["POST", "PUT", "PATCH"].includes(req.method)) {
      next();
      return;
    }

    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      sendError(
        res,
        400,
        "INVALID_BODY",
        "Request body must be a JSON object.",
      );
      return;
    }

    const { resource, id } = parseResourceSegments(req.path);
    const validator = validators[resource];

    if (!validator) {
      next();
      return;
    }

    const mode = req.method === "PATCH" ? "update" : "create";
    const errors = validator(req.body, mode, id);

    if (errors.length > 0) {
      const status = errors.some((error) => error.code === "conflict")
        ? 409
        : 400;

      sendError(
        res,
        status,
        status === 409 ? "RESOURCE_CONFLICT" : "VALIDATION_ERROR",
        status === 409
          ? "Request conflicts with existing data."
          : "Request validation failed.",
        errors,
      );
      return;
    }

    next();
  };
}

module.exports = createValidationMiddleware;
