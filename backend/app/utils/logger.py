"""
Structured logging module with color-coded console output.
"""

import logging
import sys


# ANSI color codes
COLORS = {
    "DEBUG": "\033[36m",     # Cyan
    "INFO": "\033[32m",      # Green
    "WARNING": "\033[33m",   # Yellow
    "ERROR": "\033[31m",     # Red
    "CRITICAL": "\033[35m",  # Magenta
    "RESET": "\033[0m",
}


class ColoredFormatter(logging.Formatter):
    """Custom formatter with color-coded log levels."""

    def format(self, record):
        level = record.levelname
        color = COLORS.get(level, COLORS["RESET"])
        reset = COLORS["RESET"]

        record.levelname = f"{color}{level}{reset}"
        record.msg = f"{color}{record.msg}{reset}"

        return super().format(record)


def get_logger(name: str) -> logging.Logger:
    """
    Get a configured logger instance with colored console output.

    Args:
        name: Logger name (typically __name__)

    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)

    if not logger.handlers:
        logger.setLevel(logging.DEBUG)

        # Console handler with colors
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.DEBUG)

        formatter = ColoredFormatter(
            fmt="%(asctime)s │ %(levelname)s │ %(name)s │ %(message)s",
            datefmt="%H:%M:%S",
        )
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)

        # Prevent propagation to root logger
        logger.propagate = False

    return logger


def setup_request_logging(app):
    """Setup request/response logging middleware for Flask."""

    logger = get_logger("http")

    @app.before_request
    def log_request():
        from flask import request
        logger.info(f"→ {request.method} {request.path}")

    @app.after_request
    def log_response(response):
        from flask import request
        status = response.status_code
        color = "\033[32m" if status < 400 else "\033[31m"
        reset = "\033[0m"
        logger.info(f"← {color}{status}{reset} {request.method} {request.path}")
        return response
