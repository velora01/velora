import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/Header';
import apiClient from '../../api/client';
import { Boxes, Package, Plus, X, Tag, Shield } from 'lucide-react-native';

const CATEGORIES = [
  'Hardware',
  'Plywood',
  'Laminates',
  'Marble',
  'Veneer',
  'Fittings',
  'Lighting',
  'Fabrics',
  'Glass',
  'Paint',
];

export default function InventoryMaterialsScreen({ navigation }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Hardware');
  const [brand, setBrand] = useState('Hettich');
  const [unit, setUnit] = useState('sq.ft');
  const [unitPrice, setUnitPrice] = useState('850');
  const [stockQty, setStockQty] = useState('100');
  const [vendorName, setVendorName] = useState('Prime Materials Supplier');
  const [description, setDescription] = useState('');

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/erp/materials');
      setMaterials(res.data.data || []);
    } catch (e) {
      console.error(e);
      // Fallbacks
      setMaterials([
        { _id: 'm1', name: 'Italian Carrara Marble Slab', category: 'Marble', stockQty: 45, unit: 'sq.ft', unitPrice: 850, brand: 'Imported', vendorName: 'Gres & Stones Co.' },
        { _id: 'm2', name: 'Teak Wood Veneer Sheets (8x4)', category: 'Veneer', stockQty: 120, unit: 'sheets', unitPrice: 3200, brand: 'Greenply', vendorName: 'Pune Plywoods' },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleCreateMaterial = async () => {
    if (!name.trim() || !unitPrice.trim() || !stockQty.trim()) {
      Alert.alert('Validation Error', 'Material name, price, and stock levels are required.');
      return;
    }

    const payload = {
      itemCode: 'MAT-VEL-' + Math.floor(1000 + Math.random() * 9000),
      name: name,
      category: category,
      brand: brand,
      unit: unit,
      unitPrice: parseFloat(unitPrice) || 0,
      stockQty: parseInt(stockQty) || 0,
      vendorName: vendorName,
      description: description,
    };

    try {
      setLoading(true);
      const res = await apiClient.post('/erp/materials', payload);
      if (res.data.success) {
        Alert.alert('Success', `Material ${res.data.data.itemCode} catalogued.`);
        setIsAddModalOpen(false);
        setName('');
        setDescription('');
        fetchMaterials();
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to add inventory material.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Materials & Inventory"
        subtitle="Stock Levels & Finish Catalog"
        showBack={true}
        navigation={navigation}
      />

      {loading && !refreshing ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.goldPrimary} />
      ) : (
        <FlatList
          data={materials}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchMaterials();
          }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.topRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                  <Boxes size={18} color={colors.goldPrimary} />
                  <Text style={styles.name}>{item.name}</Text>
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
              </View>

              <Text style={styles.brandText}>Brand: {item.brand || 'Velora'}</Text>
              <Text style={styles.vendorText}>Supplier: {item.vendorName || 'General vendor'}</Text>

              <View style={styles.bottomRow}>
                <View style={styles.stockBadge}>
                  <Package size={12} color={colors.goldPrimary} />
                  <Text style={styles.stockText}>
                    {item.stockQty || item.stock} {item.unit} in stock
                  </Text>
                </View>
                <Text style={styles.price}>
                  ₹{item.unitPrice} / {item.unit}
                </Text>
              </View>
            </View>
          )}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setIsAddModalOpen(true)}>
        <Plus size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Add Material Modal */}
      <Modal visible={isAddModalOpen} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Stock Material</Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <TextInput
                style={styles.modalInput}
                placeholder="Material Name (e.g. Oak Wood Panel)"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.pickerLabel}>Material Category</Text>
              <View style={styles.categorySelector}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, category === cat && styles.activeCatChip]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.catChipText, category === cat && styles.activeCatChipText]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput
                  style={[styles.modalInput, { flex: 1 }]}
                  placeholder="Brand (e.g. Hettich)"
                  value={brand}
                  onChangeText={setBrand}
                />
                <TextInput
                  style={[styles.modalInput, { flex: 1 }]}
                  placeholder="Unit (e.g. sq.ft)"
                  value={unit}
                  onChangeText={setUnit}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput
                  style={[styles.modalInput, { flex: 1 }]}
                  placeholder="Unit Price (₹)"
                  keyboardType="numeric"
                  value={unitPrice}
                  onChangeText={setUnitPrice}
                />
                <TextInput
                  style={[styles.modalInput, { flex: 1 }]}
                  placeholder="Stock Qty"
                  keyboardType="numeric"
                  value={stockQty}
                  onChangeText={setStockQty}
                />
              </View>

              <TextInput
                style={styles.modalInput}
                placeholder="Supplier/Vendor Name"
                value={vendorName}
                onChangeText={setVendorName}
              />
              <TextInput
                style={[styles.modalInput, { height: 60 }]}
                placeholder="Description / Dimension Specs"
                multiline
                numberOfLines={2}
                value={description}
                onChangeText={setDescription}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setIsAddModalOpen(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleCreateMaterial}>
                  <Text style={styles.saveText}>Catalogue Stock</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  categoryBadge: {
    backgroundColor: colors.goldBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.goldBorder,
  },
  categoryText: { fontSize: 10, fontWeight: '800', color: colors.goldPrimary },
  brandText: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  vendorText: { fontSize: 11, color: colors.textMuted },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 8,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.goldBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stockText: { fontSize: 11, fontWeight: '700', color: colors.goldPrimary },
  price: { fontSize: 13, fontWeight: '800', color: colors.textPrimary },

  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    backgroundColor: colors.goldPrimary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },

  // Modal styles
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 20 },
  modalCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  modalForm: { marginVertical: 4 },
  modalInput: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  pickerLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 8 },
  categorySelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeCatChip: { backgroundColor: colors.goldPrimary, borderColor: colors.goldPrimary },
  catChipText: { fontSize: 10, color: colors.textSecondary, fontWeight: '700' },
  activeCatChipText: { color: '#FFF' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.surfaceAlt },
  cancelText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.textPrimary },
  saveText: { fontSize: 13, fontWeight: '700', color: '#FFF' },
});
