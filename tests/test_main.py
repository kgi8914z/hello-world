"""
Tests for the main module.
"""

import pytest
from src.main import greet, calculate_sum


class TestGreet:
    """Test cases for the greet function."""
    
    def test_greet_default(self):
        """Test greet with default greeting."""
        result = greet("World")
        assert result == "Hello, World!"
    
    def test_greet_custom(self):
        """Test greet with custom greeting."""
        result = greet("Alice", "Hi")
        assert result == "Hi, Alice!"
    
    def test_greet_empty_name(self):
        """Test greet with empty name."""
        result = greet("")
        assert result == "Hello, !"


class TestCalculateSum:
    """Test cases for the calculate_sum function."""
    
    def test_calculate_sum_positive(self):
        """Test sum with positive numbers."""
        numbers = [1.0, 2.0, 3.0]
        result = calculate_sum(numbers)
        assert result == 6.0
    
    def test_calculate_sum_mixed(self):
        """Test sum with mixed positive/negative numbers."""
        numbers = [1.0, -2.0, 3.0]
        result = calculate_sum(numbers)
        assert result == 2.0
    
    def test_calculate_sum_empty(self):
        """Test sum with empty list."""
        numbers = []
        result = calculate_sum(numbers)
        assert result == 0.0
    
    def test_calculate_sum_single(self):
        """Test sum with single number."""
        numbers = [42.5]
        result = calculate_sum(numbers)
        assert result == 42.5