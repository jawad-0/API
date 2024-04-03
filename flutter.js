import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class BookScreen extends StatefulWidget {
  const BookScreen({super.key});

  @override
  State<BookScreen> createState() => _BookScreenState();
}

class _BookScreenState extends State<BookScreen> {
  @override
   List<dynamic> books = [];

  @override
  void initState() {
    super.initState();
    fetchData();
  }
  Future<void> fetchData() async {
    final response = await http.get(Uri.parse('http://192.168.10.7:2000/get'));

    if (response.statusCode == 200) {

      final List<dynamic> jsonResponse = jsonDecode(response.body);
      setState(() {
        books = jsonResponse;
      });
    } else {

      throw Exception('Failed to load books');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Book List'),
      ),
      body: SingleChildScrollView(
        child: ListView.builder(
          itemCount: books.length,
          itemBuilder: (context, index) {
            final book = books[index];
            return ListTile(
              title: Text(book['title']),
              subtitle: Text(book['author']),
            );
          },
        ),
      ),
    );
  }
}
