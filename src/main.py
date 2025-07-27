#!/usr/bin/env python3
"""
Main module for the Python project.

This is a sample main.py file to demonstrate basic Python development
with Cursor IDE.
"""

import sys
from typing import List, Optional


def greet(name: str, greeting: str = "Hello") -> str:
    """
    Generate a greeting message.
    
    Args:
        name: The name of the person to greet
        greeting: The greeting to use (default: "Hello")
        
    Returns:
        A formatted greeting string
    """
    return f"{greeting}, {name}!"


def calculate_sum(numbers: List[float]) -> float:
    """
    Calculate the sum of a list of numbers.
    
    Args:
        numbers: List of numbers to sum
        
    Returns:
        The sum of all numbers
    """
    return sum(numbers)


def main(args: Optional[List[str]] = None) -> int:
    """
    Main function.
    
    Args:
        args: Command line arguments (optional)
        
    Returns:
        Exit code (0 for success)
    """
    if args is None:
        args = sys.argv[1:]
    
    print("Welcome to your Python project!")
    print(greet("World"))
    print(greet("Cursor", "Hi"))
    
    numbers = [1.5, 2.7, 3.2, 4.8, 5.1]
    total = calculate_sum(numbers)
    print(f"Sum of {numbers} = {total}")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())